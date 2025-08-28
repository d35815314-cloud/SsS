import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Room, Booking } from "@/types/booking";
import {
  User,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Bed,
  Edit,
  Save,
  X,
  UserPlus,
  LogOut,
  ArrowRightLeft,
  CalendarPlus,
  Ticket,
} from "lucide-react";

interface BookingDetailsDialogProps {
  room?: Room | null;
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBooking?: (booking: Booking) => void;
  onCheckOut?: (bookingId: string) => void;
  onTransferRoom?: (bookingId: string, newRoomId: string) => void;
  onExtendStay?: (bookingId: string, newCheckOutDate: Date) => void;

  onOpenGuestCard?: (guestId: string) => void;
  rooms?: Room[];
}

export default function BookingDetailsDialog({
  room = null,
  booking = null,
  isOpen = false,
  onClose = () => {},
  onUpdateBooking = () => {},
  onCheckOut = () => {},
  onTransferRoom = () => {},
  onExtendStay = () => {},

  onOpenGuestCard = () => {},
  rooms = [],
}: BookingDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  const [showExtendStay, setShowExtendStay] = useState(false);
  const [showTransferRoom, setShowTransferRoom] = useState(false);
  const [selectedNewRoom, setSelectedNewRoom] = useState<string>("");

  if (!room || !booking) return null;

  const handleEditStart = () => {
    if (booking) {
      setEditedBooking({ ...booking });
      setIsEditing(true);
    }
  };

  const handleEditSave = () => {
    if (editedBooking) {
      onUpdateBooking(editedBooking);
      setIsEditing(false);
      setEditedBooking(null);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedBooking(null);
    setShowCheckInCalendar(false);
    setShowCheckOutCalendar(false);
  };

  const handleCheckOut = () => {
    if (booking) {
      onCheckOut(booking.id);
    }
  };

  const handleExtendStay = () => {
    if (booking && editedBooking) {
      onExtendStay(booking.id, editedBooking.checkOutDate);
      setShowExtendStay(false);
    }
  };

  const handleTransferRoom = () => {
    if (booking && selectedNewRoom) {
      onTransferRoom(booking.id, selectedNewRoom);
      setShowTransferRoom(false);
      setSelectedNewRoom("");
    }
  };

  const isCheckOutTime = booking && new Date() >= booking.checkOutDate;

  const availableRooms = rooms.filter(
    (r) => r.status === "available" && r.id !== room.id,
  );

  const getRoomTypeText = (type: Room["type"]) => {
    switch (type) {
      case "single":
        return "Одноместный";
      case "double":
        return "Двухместный";
      case "double_with_balcony":
        return "Двухместный с балконом";
      case "luxury":
        return "Люкс";
      default:
        return type;
    }
  };

  const getStatusText = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "Свободен";
      case "occupied":
        return "Занят";
      case "booked":
        return "Забронирован";
      case "reserved":
        return "Резерв";
      case "blocked":
        return "Заблокирован";
      default:
        return status;
    }
  };

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "booked":
        return "bg-yellow-100 text-yellow-800";
      case "reserved":
        return "bg-blue-100 text-blue-800";
      case "blocked":
        return "bg-gray-400 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bed className="w-6 h-6" />
              Бронь - Номер {room.number} - {getRoomTypeText(room.type)}
              <Badge className={getStatusColor(room.status)}>
                {getStatusText(room.status)}
              </Badge>
            </div>
            {booking && (
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEditStart}>
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditSave}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditCancel}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Information */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="w-5 h-5" />
                Информация о номере
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Номер:</span>
                  <div className="font-semibold">{room.number}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Этаж:</span>
                  <div className="font-semibold">{room.floor}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Корпус:</span>
                  <div className="font-semibold">{room.building || "A"}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Вместимость:
                  </span>
                  <div className="font-semibold">{room.capacity || 2} чел.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Информация о госте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">ФИО:</span>
                  <div className="font-semibold text-lg">
                    {booking.guestName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Телефон:
                    </span>
                    <div className="font-semibold">{booking.guestPhone}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Возраст:</span>
                    <div className="font-semibold">{booking.guestAge} лет</div>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Адрес:
                  </span>
                  <div className="font-semibold">{booking.guestAddress}</div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      Заселение:
                    </span>
                    {isEditing && editedBooking ? (
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setShowCheckInCalendar(!showCheckInCalendar)
                          }
                        >
                          {editedBooking.checkInDate.toLocaleDateString(
                            "ru-RU",
                          )}
                        </Button>
                        {showCheckInCalendar && (
                          <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                            <Calendar
                              mode="single"
                              selected={editedBooking.checkInDate}
                              onSelect={(date) => {
                                if (date) {
                                  setEditedBooking({
                                    ...editedBooking,
                                    checkInDate: date,
                                    duration: Math.ceil(
                                      (editedBooking.checkOutDate.getTime() -
                                        date.getTime()) /
                                        (1000 * 60 * 60 * 24),
                                    ),
                                  });
                                }
                                setShowCheckInCalendar(false);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="font-semibold">
                        {booking.checkInDate.toLocaleDateString("ru-RU")}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      Выселение:
                    </span>
                    {isEditing && editedBooking ? (
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setShowCheckOutCalendar(!showCheckOutCalendar)
                          }
                        >
                          {editedBooking.checkOutDate.toLocaleDateString(
                            "ru-RU",
                          )}
                        </Button>
                        {showCheckOutCalendar && (
                          <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                            <Calendar
                              mode="single"
                              selected={editedBooking.checkOutDate}
                              onSelect={(date) => {
                                if (date) {
                                  setEditedBooking({
                                    ...editedBooking,
                                    checkOutDate: date,
                                    duration: Math.ceil(
                                      (date.getTime() -
                                        editedBooking.checkInDate.getTime()) /
                                        (1000 * 60 * 60 * 24),
                                    ),
                                  });
                                }
                                setShowCheckOutCalendar(false);
                              }}
                              disabled={(date) =>
                                date <= editedBooking.checkInDate
                              }
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="font-semibold">
                        {booking.checkOutDate.toLocaleDateString("ru-RU")}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Продолжительность:
                  </span>
                  <div className="font-semibold">
                    {isEditing && editedBooking
                      ? editedBooking.duration
                      : booking.duration}{" "}
                    дней
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600">Пол:</span>
                  <div className="font-semibold">
                    {booking.guestGender === "male" ? "Мужской" : "Женский"}
                  </div>
                </div>

                {booking.voucherNumber && (
                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      Номер путевки:
                    </span>
                    <div className="font-semibold">{booking.voucherNumber}</div>
                  </div>
                )}

                {booking.secondGuestName && (
                  <>
                    <Separator />
                    <div>
                      <span className="font-medium text-gray-600">
                        Второй гость:
                      </span>
                      <div className="font-semibold">
                        {booking.secondGuestName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.secondGuestGender === "male"
                          ? "Мужской"
                          : "Женский"}
                      </div>
                    </div>
                  </>
                )}

                {isCheckOutTime && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        Время выселения истекло
                      </span>
                    </div>
                    <div className="text-sm text-orange-600 mt-1">
                      Автоматическое выселение доступно
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extend Stay */}
        {showExtendStay && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CalendarPlus className="w-5 h-5" />
                Продлить срок пребывания
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Текущая дата выселения
                    </label>
                    <div className="p-2 bg-gray-100 rounded">
                      {booking.checkOutDate.toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Новая дата выселения
                    </label>
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowCheckOutCalendar(!showCheckOutCalendar)
                        }
                      >
                        {editedBooking?.checkOutDate.toLocaleDateString(
                          "ru-RU",
                        ) || "Выберите дату"}
                      </Button>
                      {showCheckOutCalendar && (
                        <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                          <Calendar
                            mode="single"
                            selected={editedBooking?.checkOutDate}
                            onSelect={(date) => {
                              if (date && editedBooking) {
                                setEditedBooking({
                                  ...editedBooking,
                                  checkOutDate: date,
                                  duration: Math.ceil(
                                    (date.getTime() -
                                      editedBooking.checkInDate.getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  ),
                                });
                              }
                              setShowCheckOutCalendar(false);
                            }}
                            disabled={(date) => date <= booking.checkInDate}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleExtendStay}>Продлить</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowExtendStay(false);
                      setEditedBooking(null);
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transfer Room */}
        {showTransferRoom && (
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <ArrowRightLeft className="w-5 h-5" />
                Перевести в другой номер
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Выберите новый номер
                  </label>
                  <Select
                    value={selectedNewRoom}
                    onValueChange={setSelectedNewRoom}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите номер" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((availableRoom) => (
                        <SelectItem
                          key={availableRoom.id}
                          value={availableRoom.id}
                        >
                          {availableRoom.number} -{" "}
                          {getRoomTypeText(availableRoom.type)} (Этаж{" "}
                          {availableRoom.floor})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleTransferRoom}
                    disabled={!selectedNewRoom}
                  >
                    Перевести
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTransferRoom(false);
                      setSelectedNewRoom("");
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => booking && onOpenGuestCard(booking.guestId)}
            >
              <User className="w-4 h-4 mr-2" />
              Карточка гостя
            </Button>
            {isCheckOutTime && (
              <Button variant="destructive" onClick={handleCheckOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Выселить
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setEditedBooking({ ...booking });
                setShowExtendStay(true);
              }}
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              Продлить срок
            </Button>
            <Button variant="outline" onClick={() => setShowTransferRoom(true)}>
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Перевести
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
