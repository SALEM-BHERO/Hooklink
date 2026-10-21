from datetime import datetime, timezone
from typing import Annotated, List, Literal, Optional

from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]

Provider = Literal["groq", "gemini", "deepseek"]
Tone = Literal["professional", "storytelling", "contrarian", "technical"]
Goal = Literal["brand", "news", "hiring"]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)

    def to_mongo(self) -> dict:
        return self.model_dump(by_alias=True, exclude={"id"})

    def to_api(self) -> dict:
        return self.model_dump()


class Hook(BaseModel):
    title: str
    text: str


class Draft(BaseDocument):
    client_id: str
    topic: str
    goal: str
    tone: str
    provider: str
    post_body: str
    hooks: List[Hook]
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class LibraryHook(BaseDocument):
    number: int
    category: str
    category_label: str
    text: str
    theme: str
    featured: bool = False
    title: Optional[str] = None
    why: Optional[str] = None


class Subscriber(BaseDocument):
    email: EmailStr
    created_at: str = Field(default_factory=now_iso)


class GenerateRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=3000)
    goal: Goal = "brand"
    tone: Tone = "professional"
    provider: Provider = "groq"


class RegenerateHooksRequest(BaseModel):
    post_body: str = Field(min_length=1, max_length=6000)
    draft_id: Optional[str] = None
    provider: Provider = "groq"


class RefineToneRequest(BaseModel):
    post_body: str = Field(min_length=1, max_length=6000)
    tone: Tone
    draft_id: Optional[str] = None
    provider: Provider = "groq"


class DraftUpdate(BaseModel):
    post_body: Optional[str] = Field(default=None, max_length=6000)
    hooks: Optional[List[Hook]] = None


class NewsletterRequest(BaseModel):
    email: EmailStr
