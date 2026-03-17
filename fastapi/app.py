import base64
import json
import os
import uuid
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from openai import OpenAI


load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.base_dir = Path(__file__).resolve().parent
        self.prompts_file = self.base_dir / "prompts" / "prompts.json"
        self.upload_dir = self.base_dir / "uploads"
        self.generated_dir = self.base_dir / "generated"
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.image_model = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1-mini")

        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.generated_dir.mkdir(parents=True, exist_ok=True)


class PromptRepository:
    def __init__(self, prompts_file: Path) -> None:
        self.prompts_file = prompts_file

    def get_all(self) -> List[dict]:
        if not self.prompts_file.exists():
            return []
        with open(self.prompts_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_by_id(self, prompt_id: str) -> Optional[dict]:
        prompts = self.get_all()
        for prompt in prompts:
            if prompt.get("id") == prompt_id:
                return prompt
        return None


class FileManager:
    def __init__(self, upload_dir: Path, generated_dir: Path) -> None:
        self.upload_dir = upload_dir
        self.generated_dir = generated_dir

    async def save_upload(self, file: UploadFile) -> Path:
        suffix = Path(file.filename).suffix if file.filename else ".png"
        file_name = f"{uuid.uuid4().hex}{suffix}"
        file_path = self.upload_dir / file_name

        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        return file_path

    def save_generated_image(self, image_base64: str, extension: str = "png") -> str:
        file_name = f"{uuid.uuid4().hex}.{extension}"
        file_path = self.generated_dir / file_name

        image_bytes = base64.b64decode(image_base64)
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        return file_name


class OpenAIImageGenerator:
    def __init__(self, api_key: str, model: str) -> None:
        if not api_key:
            raise ValueError("OPENAI_API_KEY is missing.")
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def generate_from_reference_image(
        self,
        image_path: Path,
        prompt_text: str,
        num_images: int = 1,
        size: str = "1024x1024",
        quality: str = "low",
    ) -> List[str]:
        """
        Returns a list of base64-encoded generated images.

        For cost-effective generation:
        - model: gpt-image-1-mini
        - quality: low
        - size: 1024x1024
        """
        with open(image_path, "rb") as image_file:
            result = self.client.images.edit(
                model=self.model,
                image=image_file,
                prompt=prompt_text,
                size=size,
                quality=quality,
                n=num_images,
            )

        outputs: List[str] = []

        # SDK responses can expose b64_json on each item
        for item in result.data:
            if hasattr(item, "b64_json") and item.b64_json:
                outputs.append(item.b64_json)
            else:
                raise RuntimeError("Image response did not include b64_json output.")

        return outputs


class ImageGenerationService:
    def __init__(
        self,
        prompt_repository: PromptRepository,
        file_manager: FileManager,
        image_generator: OpenAIImageGenerator,
    ) -> None:
        self.prompt_repository = prompt_repository
        self.file_manager = file_manager
        self.image_generator = image_generator

    async def generate(
        self,
        prompt_id: str,
        image_file: UploadFile,
        num_images: int,
        request_base_url: str,
    ) -> dict:
        prompt_obj = self.prompt_repository.get_by_id(prompt_id)
        if not prompt_obj:
            raise HTTPException(status_code=400, detail="Invalid prompt_id")

        saved_upload_path = await self.file_manager.save_upload(image_file)

        generated_b64_images = self.image_generator.generate_from_reference_image(
            image_path=saved_upload_path,
            prompt_text=prompt_obj["template"],
            num_images=num_images,
            size="1024x1024",
            quality="low",
        )

        image_urls: List[str] = []
        for encoded_img in generated_b64_images:
            file_name = self.file_manager.save_generated_image(encoded_img, extension="png")
            image_urls.append(f"{request_base_url}generated/{file_name}")

        return {
            "status": "success",
            "prompt_id": prompt_obj["id"],
            "prompt_name": prompt_obj["name"],
            "prompt_used": prompt_obj["template"],
            "images": image_urls,
        }


settings = Settings()
prompt_repository = PromptRepository(settings.prompts_file)
file_manager = FileManager(settings.upload_dir, settings.generated_dir)
image_generator = OpenAIImageGenerator(
    api_key=settings.openai_api_key,
    model=settings.image_model,
)
generation_service = ImageGenerationService(
    prompt_repository=prompt_repository,
    file_manager=file_manager,
    image_generator=image_generator,
)

app = FastAPI(title="Image Prompt App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/generated", StaticFiles(directory=str(settings.generated_dir)), name="generated")


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model": settings.image_model,
    }


@app.get("/prompts")
def get_prompts() -> List[dict]:
    prompts = prompt_repository.get_all()
    return [{"id": p["id"], "name": p["name"]} for p in prompts]


@app.post("/generate-images")
async def generate_images(
    prompt_id: str = Form(...),
    num_images: int = Form(...),
    image: UploadFile = File(...),
):
    if num_images < 1 or num_images > 8:
        raise HTTPException(status_code=400, detail="num_images must be between 1 and 8")

    result = await generation_service.generate(
        prompt_id=prompt_id,
        image_file=image,
        num_images=num_images,
        request_base_url="http://localhost:8000/",
    )
    return result

@app.get("/download/{file_name}")
def download_file(file_name: str):
    file_path = settings.generated_dir / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type="application/octet-stream"
    )