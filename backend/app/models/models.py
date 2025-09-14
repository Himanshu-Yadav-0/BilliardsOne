import uuid
import enum
from sqlalchemy import Column, String, ForeignKey, text, Enum, DECIMAL, TIMESTAMP, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class TableType(enum.Enum):
    pool = "8-Ball Pool"
    snooker = "Snooker"

class TableStatus(enum.Enum):
    available = "Available"
    in_use = "In Use"
    out_of_service = "Out of Service"

class PaymentMethod(enum.Enum):
    cash = "Cash"
    online = "Online"

class BillingStrategy(enum.Enum):
    pro_rata = "Pro_Rata"
    per_minute = "Per_Minute"
    fixed_hour = "Fixed_Hour"

class Owner(Base):
    __tablename__ = 'owners'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    ownerName = Column(String, nullable=False)
    mobileNo = Column(String, nullable=False, unique=True)
    pinHash = Column(String, nullable=False)
    cafes = relationship("Cafe", back_populates="owner", cascade="all, delete-orphan")

class Cafe(Base):
    __tablename__ = 'cafes'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    cafeName = Column(String, nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('owners.id'), nullable=False)
    billingStrategy = Column(Enum(BillingStrategy), nullable=False, default=BillingStrategy.pro_rata)
    owner = relationship("Owner", back_populates="cafes")
    staff = relationship("Staff", back_populates="cafe", cascade="all, delete-orphan")
    tables = relationship("Table", back_populates="cafe", cascade="all, delete-orphan")
    pricing = relationship("Pricing", back_populates="cafe", cascade="all, delete-orphan")

class Staff(Base):
    __tablename__ = 'staff'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    staffName = Column(String, nullable=False)
    mobileNo = Column(String, nullable=False, unique=True)
    pin = Column(String, nullable=False)
    cafe_id = Column(UUID(as_uuid=True), ForeignKey('cafes.id'), nullable=False)
    cafe = relationship("Cafe", back_populates="staff")
    game_sessions = relationship("GameSession", back_populates="staff", cascade="all, delete-orphan")

class Table(Base):
    __tablename__ = 'tables'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    tableName = Column(String, nullable=False)
    tableType = Column(Enum(TableType), nullable=False)
    status = Column(Enum(TableStatus), nullable=False, default=TableStatus.available)
    cafe_id = Column(UUID(as_uuid=True), ForeignKey('cafes.id'), nullable=False)
    cafe = relationship("Cafe", back_populates="tables")
    game_sessions = relationship("GameSession", back_populates="table", cascade="all, delete-orphan")

class GameSession(Base):
    __tablename__ = 'game_sessions'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    startTime = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)
    endTime = Column(TIMESTAMP(timezone=True), nullable=True)
    table_id = Column(UUID(as_uuid=True), ForeignKey('tables.id'), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey('staff.id'), nullable=False)
    
    table = relationship("Table", back_populates="game_sessions")
    staff = relationship("Staff", back_populates="game_sessions")
    player_changes = relationship("PlayerChange", back_populates="game_session", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="game_session", uselist=False, cascade="all, delete-orphan")

class PlayerChange(Base):
    __tablename__ = 'player_changes'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)
    numberOfPlayers = Column(Integer, nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey('game_sessions.id'), nullable=False)
    game_session = relationship("GameSession", back_populates="player_changes")

class Payment(Base):
    __tablename__ = 'payments'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    totalAmount = Column(DECIMAL(10, 2), nullable=False)
    timePlayedInMinutes = Column(Integer, nullable=False)
    paymentMethod = Column(Enum(PaymentMethod), nullable=False)
    paymentTimestamp = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.id"), unique=True, nullable=False)
    game_session = relationship("GameSession", back_populates="payment")

class Pricing(Base):
    __tablename__ = 'pricing'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    tableType = Column(Enum(TableType), nullable=False)
    hourPrice = Column(DECIMAL(10, 2), nullable=False)
    halfHourPrice = Column(DECIMAL(10, 2), nullable=False)
    extraPlayerPrice = Column(DECIMAL(10, 2), nullable=False)
    cafe_id = Column(UUID(as_uuid=True), ForeignKey('cafes.id'), nullable=False)
    cafe = relationship("Cafe", back_populates="pricing")

