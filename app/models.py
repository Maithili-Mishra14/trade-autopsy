
from pydantic import BaseModel
from typing import Optional

class Trade(BaseModel):
    capital: float
    entry_price: float
    exit_price: float
    stop_loss: float
    quantity: int
    direction: str  # "long" or "short"
