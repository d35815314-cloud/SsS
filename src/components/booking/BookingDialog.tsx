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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Room, Booking, Service, Guest } from "@/types/booking";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Save,
  Printer,
  CreditCard,
  Bed,
} from "lucide-react";

interface BookingDialogProps {
  room?: Room | null;
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onBookRoom?: (bookingData: Omit<Booking, "id" | "createdAt">) => void;
  onUpdateBooking?: (booking: Booking) => void;
  onAddPayment?: (bookingId: string, amount: number) => void;
  rooms?: Room[];
  guests?: Guest[];
}

const mockServices: Service[] = [
  { id: "1", name: "Массаж", price: 1500, category: "spa", duration: 60 },
  { id: "2", name: "Завтрак", price: 800, category: "dining" },
  { id: "3", name: "Трансфер", price: 500, category: "transport" },
  {
    id: "4",
    name: "Экскурсия",
    price: 2000,
    category: "entertainment",
    duration: 180,
  },
  { id: "5", name: "Обед", price: 1200, category: "dining" },
  { id: "6", name: "Ужин", price: 1500, category: "dining" },
  { id: "7", name: "Сауна", price: 2000, category: "spa", duration: 90 },
];

export default function BookingDialog({
  room = null,
  booking = null,
  isOpen = false,
  onClose = () => {},
  onBookRoom = () => {},
  onUpdateBooking = () => {},
  onAddPayment = () => {},
  rooms = [],
  guests = [],
}: BookingDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPaymentInput, setShowPaymentInput] = useState(false);

  // New booking form state
  const [isCreatingNew, setIsCreatingNew] = useState(!booking);
  const [selectedRoomId, setSelectedRoomId] = useState(room?.id || "");

  // Update selectedRoomId when room prop changes
  useState(() => {
    if (room?.id && selectedRoomId !== room.id) {
      setSelectedRoomId(room.id);
    }
  });
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAge, setGuestAge] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [guestGender, setGuestGender] = useState<"male" | "female">("male");
  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [secondGuestName, setSecondGuestName] = useState("");
  const [secondGuestGender, setSecondGuestGender] = useState<"male" | "female">(
    "male",
  );
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  if (!booking && !isCreatingNew) return null;

  const handleEditStart = () => {
    setEditedBooking({ ...booking });
    setIsEditing(true);
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
  };

  const handleAddService = (service: Service) => {
    if (editedBooking) {
      const newServices = [...(editedBooking.services || []), service];
      const newServiceCharges = newServices.reduce(
        (sum, s) => sum + s.price,
        0,
      );
      const roomCharges = editedBooking.totalAmount || 0;
      const newTotalAmount = roomCharges + newServiceCharges;

      setEditedBooking({
        ...editedBooking,
        services: newServices,
        totalAmount: newTotalAmount,
      });
    }
  };

  const handleRemoveService = (serviceId: string) => {
    if (editedBooking) {
      const newServices = (editedBooking.services || []).filter(
        (s) => s.id !== serviceId,
      );
      const newServiceCharges = newServices.reduce(
        (sum, s) => sum + s.price,
        0,
      );
      const roomCharges = editedBooking.totalAmount || 0;
      const newTotalAmount = roomCharges + newServiceCharges;

      setEditedBooking({
        ...editedBooking,
        services: newServices,
        totalAmount: newTotalAmount,
      });
    }
  };

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    const balance = (booking.totalAmount || 0) - (booking.totalAmount || 0); // Simplified for now
    if (amount > 0 && amount <= balance) {
      onAddPayment(booking.id, amount);
      setPaymentAmount("");
      setShowPaymentInput(false);
    }
  };

  const handleCreateBooking = () => {
    if (
      !selectedRoomId ||
      !guestName ||
      !guestPhone ||
      !guestAge ||
      !guestAddress
    ) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const duration = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (duration <= 0) {
      alert("Дата выезда должна быть позже даты заезда");
      return;
    }

    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
    const basePrice = selectedRoom?.pricePerNight || 3000;
    const totalAmount =
      basePrice * duration +
      selectedServices.reduce((sum, s) => sum + s.price, 0);

    const bookingData: Omit<Booking, "id" | "createdAt"> = {
      roomId: selectedRoomId,
      guestId: `guest-${Date.now()}`,
      guestName,
      guestPhone,
      guestAge: parseInt(guestAge),
      guestAddress,
      guestGender,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      checkInTime,
      checkOutTime,
      duration,
      status: "active",
      services: selectedServices,
      totalAmount,
      voucherNumber: voucherNumber || undefined,
      secondGuestName: secondGuestName || undefined,
      secondGuestGender: secondGuestName ? secondGuestGender : undefined,
    };

    onBookRoom(bookingData);
    onClose();
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Бронь ${booking.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <h1>Бронь ${booking.id}</h1>
          <div class="header">
            <div>
              <strong>Гость:</strong> ${booking.guestName}<br>
              <strong>Заезд:</strong> ${booking.checkInDate.toLocaleDateString("ru-RU")}<br>
              <strong>Выезд:</strong> ${booking.checkOutDate.toLocaleDateString("ru-RU")}
            </div>
            <div>
              <strong>Дата создания:</strong> ${new Date().toLocaleDateString("ru-RU")}<br>
              <strong>Статус:</strong> ${booking.status === "active" ? "Активна" : booking.status === "completed" ? "Завершена" : "Отменена"}
            </div>
          </div>
          
          <h3>Услуги:</h3>
          <table>
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Категория</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Проживание</td>
                <td>Размещение</td>
                <td>${(booking.totalAmount || 0).toLocaleString()} ₽</td>
              </tr>
              ${(booking.services || [])
                .map(
                  (service) => `
                <tr>
                  <td>${service.name}</td>
                  <td>${service.category}</td>
                  <td>${service.price.toLocaleString()} ₽</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div style="margin-top: 20px;">
            <div class="total">Итого: ${(booking.totalAmount || 0).toLocaleString()} ₽</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const currentBooking = isEditing ? editedBooking : booking;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCreatingNew ? (
                <>
                  <Plus className="w-6 h-6" />
                  Создать новое бронирование
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6" />
                  Бронь {currentBooking?.id}
                  <Badge
                    variant={
                      currentBooking?.status === "completed"
                        ? "default"
                        : currentBooking?.status === "active"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {currentBooking?.status === "completed"
                      ? "Завершена"
                      : currentBooking?.status === "active"
                        ? "Активна"
                        : "Отменена"}
                  </Badge>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isCreatingNew && !isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEditStart}>
                  Редактировать
                </Button>
              ) : !isCreatingNew ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEditSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCancel}
                  >
                    Отмена
                  </Button>
                </div>
              ) : null}
            </div>
          </DialogTitle>
        </DialogHeader>

        {isCreatingNew ? (
          // New booking form
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Room Selection */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    Выбор номера
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="room-select">Номер *</Label>
                    <Select
                      value={selectedRoomId}
                      onValueChange={setSelectedRoomId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите номер" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms
                          .filter((r) => r.status === "available")
                          .map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              Номер {room.number} -{" "}
                              {room.type === "single"
                                ? "Одноместный"
                                : room.type === "double"
                                  ? "Двухместный"
                                  : room.type === "double_with_balcony"
                                    ? "С балконом"
                                    : "Люкс"}
                              {room.pricePerNight &&
                                ` (${room.pricePerNight.toLocaleString()} ₽/ночь)`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkin-date">Дата заезда *</Label>
                      <Input
                        id="checkin-date"
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkout-date">Дата выезда *</Label>
                      <Input
                        id="checkout-date"
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkin-time">Время заезда *</Label>
                      <Select
                        value={checkInTime}
                        onValueChange={setCheckInTime}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">09:00 - Утро</SelectItem>
                          <SelectItem value="14:00">14:00 - День</SelectItem>
                          <SelectItem value="18:00">18:00 - Вечер</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="checkout-time">Время выезда *</Label>
                      <Select
                        value={checkOutTime}
                        onValueChange={setCheckOutTime}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">09:00 - Утро</SelectItem>
                          <SelectItem value="12:00">12:00 - День</SelectItem>
                          <SelectItem value="18:00">18:00 - Вечер</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="voucher">Номер путевки</Label>
                    <Input
                      id="voucher"
                      value={voucherNumber}
                      onChange={(e) => setVoucherNumber(e.target.value)}
                      placeholder="Необязательно"
                    />
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
                  <div>
                    <Label htmlFor="guest-name">ФИО *</Label>
                    <Input
                      id="guest-name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Фамилия Имя Отчество"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guest-phone">Телефон *</Label>
                      <Input
                        id="guest-phone"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guest-age">Возраст *</Label>
                      <Input
                        id="guest-age"
                        type="number"
                        value={guestAge}
                        onChange={(e) => setGuestAge(e.target.value)}
                        placeholder="25"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guest-address">Адрес *</Label>
                    <Textarea
                      id="guest-address"
                      value={guestAddress}
                      onChange={(e) => setGuestAddress(e.target.value)}
                      placeholder="Полный адрес проживания"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="guest-gender">Пол *</Label>
                    <Select
                      value={guestGender}
                      onValueChange={(value: "male" | "female") =>
                        setGuestGender(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Мужской</SelectItem>
                        <SelectItem value="female">Женский</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Guest */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Второй гость (необязательно)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="second-guest-name">ФИО второго гостя</Label>
                    <Input
                      id="second-guest-name"
                      value={secondGuestName}
                      onChange={(e) => setSecondGuestName(e.target.value)}
                      placeholder="Фамилия Имя Отчество"
                    />
                  </div>
                  <div>
                    <Label htmlFor="second-guest-gender">Пол</Label>
                    <Select
                      value={secondGuestGender}
                      onValueChange={(value: "male" | "female") =>
                        setSecondGuestGender(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Мужской</SelectItem>
                        <SelectItem value="female">Женский</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button onClick={handleCreateBooking}>
                <Save className="w-4 h-4 mr-2" />
                Создать бронирование
              </Button>
            </div>
          </div>
        ) : (
          // Existing booking view
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Guest and Room Information */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Информация о госте
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Гость:</span>
                      <div className="font-semibold">
                        {currentBooking?.guestName}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Телефон:
                      </span>
                      <div className="font-semibold">
                        {currentBooking?.guestPhone}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Заезд:
                      </span>
                      <div className="font-semibold">
                        {currentBooking?.checkInDate.toLocaleDateString(
                          "ru-RU",
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Выезд:
                      </span>
                      <div className="font-semibold">
                        {currentBooking?.checkOutDate.toLocaleDateString(
                          "ru-RU",
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Финансовая сводка
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Проживание:</span>
                      <span className="font-semibold">
                        {(currentBooking?.totalAmount || 0).toLocaleString()} ₽
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Услуги:</span>
                      <span className="font-semibold">
                        {(currentBooking?.services || [])
                          .reduce((sum, s) => sum + s.price, 0)
                          .toLocaleString()}{" "}
                        ₽
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Итого:</span>
                      <span>
                        {(currentBooking?.totalAmount || 0).toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Услуги
                  </div>
                  {isEditing && (
                    <div className="text-sm text-gray-600">
                      Нажмите на услугу чтобы добавить
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Room Charges */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">Проживание</div>
                      <div className="text-sm text-gray-600">
                        Размещение в номере
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        {(currentBooking?.totalAmount || 0).toLocaleString()} ₽
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Размещение
                      </Badge>
                    </div>
                  </div>

                  {/* Ordered Services */}
                  {(currentBooking?.services || []).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-gray-600">
                            {service.description}
                          </div>
                        )}
                        {service.duration && (
                          <div className="text-xs text-gray-500">
                            Продолжительность: {service.duration} мин
                          </div>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="font-bold text-green-600">
                            {service.price.toLocaleString()} ₽
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {service.category}
                          </Badge>
                        </div>
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Available Services (when editing) */}
                  {isEditing && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Доступные услуги:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {mockServices
                          .filter(
                            (service) =>
                              !(currentBooking?.services || []).some(
                                (s) => s.id === service.id,
                              ),
                          )
                          .map((service) => (
                            <Button
                              key={service.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddService(service)}
                              className="justify-between"
                            >
                              <span>{service.name}</span>
                              <span>{service.price.toLocaleString()} ₽</span>
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Закрыть
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Печать
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
