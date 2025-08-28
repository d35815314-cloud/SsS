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
import { Guest, Booking } from "@/types/booking";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  History,
  Edit,
  UserCheck,
} from "lucide-react";

interface GuestCardProps {
  guest?: Guest | null;
  bookings?: Booking[];
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onNewBooking?: (guestId: string) => void;
}

export default function GuestCard({
  guest = null,
  bookings = [],
  isOpen = false,
  onClose = () => {},
  onEdit = () => {},
  onNewBooking = () => {},
}: GuestCardProps) {
  if (!guest) return null;

  const activeBookings = bookings.filter(
    (b) => b.status === "active" || b.status === "checked_in",
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalStays = completedBookings.length;
  const totalSpent = bookings.reduce(
    (sum, booking) => sum + (booking.totalAmount || 0),
    0,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" />
              Карточка гостя
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Личная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {guest.firstName.charAt(0)}
                  {guest.lastName.charAt(0)}
                </div>
                <h3 className="text-xl font-bold">{guest.fullName}</h3>
                <p className="text-gray-600">ID: {guest.id.slice(0, 8)}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600">Имя:</span>
                    <div className="font-semibold">{guest.firstName}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Фамилия:</span>
                    <div className="font-semibold">{guest.lastName}</div>
                  </div>
                </div>

                {guest.middleName && (
                  <div>
                    <span className="font-medium text-gray-600">Отчество:</span>
                    <div className="font-semibold">{guest.middleName}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Дата рождения:
                    </span>
                    <div className="font-semibold">
                      {guest.dateOfBirth.toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Возраст:</span>
                    <div className="font-semibold">{guest.age} лет</div>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600">Пол:</span>
                  <div className="font-semibold">
                    {guest.gender === "male" ? "Мужской" : "Женский"}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Паспорт:
                  </span>
                  <div className="font-semibold">{guest.passportNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Контактная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Телефон:
                  </span>
                  <div className="font-semibold text-lg">{guest.phone}</div>
                </div>

                {guest.email && (
                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email:
                    </span>
                    <div className="font-semibold">{guest.email}</div>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Адрес:
                  </span>
                  <div className="font-semibold">{guest.address}</div>
                </div>

                {guest.emergencyContact && (
                  <>
                    <Separator />
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Экстренный контакт:
                      </span>
                      <div className="font-semibold">
                        {guest.emergencyContact}
                      </div>
                      {guest.emergencyPhone && (
                        <div className="text-sm text-gray-600">
                          {guest.emergencyPhone}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {guest.notes && (
                  <>
                    <Separator />
                    <div>
                      <span className="font-medium text-gray-600">
                        Заметки:
                      </span>
                      <div className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                        {guest.notes}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <History className="w-5 h-5" />
              Статистика проживания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalStays}
                </div>
                <div className="text-sm text-gray-600">Всего проживаний</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {totalSpent.toLocaleString()} ₽
                </div>
                <div className="text-sm text-gray-600">Общая сумма</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {activeBookings.length}
                </div>
                <div className="text-sm text-gray-600">Активных броней</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {guest.createdAt.toLocaleDateString("ru-RU")}
                </div>
                <div className="text-sm text-gray-600">Первое посещение</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking History */}
        {bookings.length > 0 && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                История бронирований
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {bookings.slice(0, 10).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Номер {booking.roomId}
                        </span>
                        <Badge
                          variant={
                            booking.status === "active" ||
                            booking.status === "checked_in"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {booking.status === "active"
                            ? "Активно"
                            : booking.status === "checked_in"
                              ? "Заселен"
                              : booking.status === "completed"
                                ? "Завершено"
                                : booking.status === "cancelled"
                                  ? "Отменено"
                                  : booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.checkInDate.toLocaleDateString("ru-RU")} -{" "}
                        {booking.checkOutDate.toLocaleDateString("ru-RU")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.duration} дней
                        {booking.voucherNumber && (
                          <span className="ml-2">
                            • Путевка: {booking.voucherNumber}
                          </span>
                        )}
                      </div>
                      {booking.secondGuestName && (
                        <div className="text-xs text-blue-600">
                          + {booking.secondGuestName}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {booking.totalAmount && (
                        <div className="font-bold text-green-600">
                          {booking.totalAmount.toLocaleString()} ₽
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {booking.createdAt.toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            <Button variant="outline">История платежей</Button>
          </div>
          <Button onClick={() => guest && onNewBooking(guest.id)}>
            <UserCheck className="w-4 h-4 mr-2" />
            Новое бронирование
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
