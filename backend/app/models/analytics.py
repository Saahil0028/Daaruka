import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Index, String
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.guid import GUID


class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    site_id = Column(GUID(), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False)
    data_source = Column(String(100), nullable=False, default="Sentinel-2 L2A")
    is_simulated = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    site = relationship("Site", back_populates="analytics")

Index("idx_analytics_site_date", SiteAnalytics.site_id, SiteAnalytics.recorded_at)
