import { useState, useCallback } from "react";
import { Room, Booking } from "@/types/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserPlus,
  FileText,
  User,
  Printer,
  LogIn,
  LogOut,
} from "lucide-react";

interface CalendarViewProps {
  rooms?: Room[];
  bookings?: Booking[];
  selectedFloor?: number;
  selectedBuilding?: string;
  onRoomClick?: (room: Room) => void;
  onBookRoom?: (booking: any) => void;
  onDateRangeSelect?: (room: Room, startDate: Date, endDate: Date) => void;
  onContextMenuAction?: (action: string, room: Room) => void;
}

const getRoomStatusColor = (status: Room["status"]) => {
  switch (status) {
    case "available":
      return "bg-green-100 border-green-300";
    case "occupied":
      return "bg-red-100 border-red-300";
    case "booked":
      return "bg-yellow-100 border-yellow-300";
    case "reserved":
      return "bg-blue-100 border-blue-300";
    case "blocked":
      return "bg-gray-400 border-gray-600";
    default:
      return "bg-gray-100 border-gray-300";
  }
};

const getRoomTypeText = (type: Room["type"]) => {
  switch (type) {
    case "single":
      return "1м";
    case "double":
      return "2м";
    case "double_with_balcony":
      return "2м+б";
    case "luxury":
      return "Люкс";
    default:
      return type;
  }
};

export default function CalendarView({
  rooms = [],
  bookings = [],
  selectedFloor = 1,
  selectedBuilding = "A",
  onRoomClick = () => {},
  onBookRoom = () => {},
  onDateRangeSelect = () => {},
  onContextMenuAction = () => {},
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    room: Room;
    date: Date;
  } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{
    room: Room;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  // Generate 7 days starting from current date
  const generateDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const days = generateDays();
  const floorRooms = rooms.filter(
    (room) =>
      room.floor === selectedFloor && room.building === selectedBuilding,
  );

  // Get bookings for a specific room and date
  const getBookingForRoomAndDate = (roomId: string, date: Date) => {
    return bookings.find((booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return (
        booking.roomId === roomId &&
        date >= checkIn &&
        date < checkOut &&
        booking.status === "active"
      );
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("ru-RU", { weekday: "short" });
  };

  const handleCellClick = useCallback(
    (room: Room, date: Date) => {
      const booking = getBookingForRoomAndDate(room.id, date);

      if (booking) {
        // If there's a booking, show room details
        onRoomClick(room);
        return;
      }

      if (!isSelecting) {
        // Start selection
        setIsSelecting(true);
        setSelectionStart({ room, date });
        setSelectedRange({ room, startDate: date, endDate: date });
      } else if (selectionStart && selectionStart.room.id === room.id) {
        // End selection on same room
        const startDate =
          selectionStart.date < date ? selectionStart.date : date;
        const endDate = selectionStart.date < date ? date : selectionStart.date;

        setSelectedRange({ room, startDate, endDate });
        setIsSelecting(false);

        // Call the callback with selected range
        onDateRangeSelect(room, startDate, endDate);

        // Reset selection after a short delay
        setTimeout(() => {
          setSelectionStart(null);
          setSelectedRange(null);
        }, 2000);
      } else {
        // Cancel selection if clicking on different room
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectedRange(null);
      }
    },
    [isSelecting, selectionStart, onRoomClick, onDateRangeSelect],
  );

  const isCellInSelection = (room: Room, date: Date) => {
    if (!selectedRange || selectedRange.room.id !== room.id) return false;
    return date >= selectedRange.startDate && date <= selectedRange.endDate;
  };

  const isCellSelectionStart = (room: Room, date: Date) => {
    if (!selectedRange || selectedRange.room.id !== room.id) return false;
    return date.getTime() === selectedRange.startDate.getTime();
  };

  const isCellSelectionEnd = (room: Room, date: Date) => {
    if (!selectedRange || selectedRange.room.id !== room.id) return false;
    return date.getTime() === selectedRange.endDate.getTime();
  };

  // Handle room context menu actions
  const handleContextAction = (action: string, room: Room) => {
    onContextMenuAction(action, room);
  };

  return (
    <div className="bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Календарь занятости - Корпус {selectedBuilding}, Этаж {selectedFloor}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-4">
            {formatDate(days[0])} - {formatDate(days[6])}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header with dates */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="p-2 text-center font-semibold bg-gray-100 rounded">
              Номер
            </div>
            {days.map((day, index) => (
              <div
                key={index}
                className="p-2 text-center font-semibold bg-blue-50 rounded"
              >
                <div className="text-xs text-gray-600">
                  {formatDayName(day)}
                </div>
                <div className="text-sm">{formatDate(day)}</div>
              </div>
            ))}
          </div>

          {/* Room rows */}
          <div className="space-y-1">
            {floorRooms.slice(0, 20).map((room) => {
              const roomBookings = bookings.filter(
                (b) => b.roomId === room.id && b.status === "active",
              );
              const occupancyRate =
                room.type === "single" ? 1 : room.type === "luxury" ? 3 : 2;
              const currentOccupancy = roomBookings.length;

              return (
                <div key={room.id} className="grid grid-cols-8 gap-1">
                  {/* Room info column */}
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <div
                        className={cn(
                          "p-2 border-2 rounded cursor-pointer transition-colors",
                          getRoomStatusColor(room.status),
                        )}
                        onClick={() => onRoomClick(room)}
                      >
                        <div className="text-sm font-semibold">
                          {room.number}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getRoomTypeText(room.type)}
                        </div>
                        {room.type !== "single" && (
                          <div className="text-xs">
                            {currentOccupancy}/{occupancyRate}
                          </div>
                        )}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem
                        onClick={() => handleContextAction("checkin", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        Заселить
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleContextAction("checkout", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Выселить
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => handleContextAction("booking", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        Открыть бронь
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleContextAction("guest", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        Карточка гостя
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => handleContextAction("report", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        Печать отчета
                      </ContextMenuItem>
                      <ContextMenuSeparator />

                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => handleContextAction("block", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        {room.status === "blocked"
                          ? "Разблокировать"
                          : "Заблокировать"}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  {/* Day columns */}
                  {days.map((day, dayIndex) => {
                    const booking = getBookingForRoomAndDate(room.id, day);
                    const isToday =
                      day.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "p-1 border rounded min-h-[60px] relative cursor-pointer transition-all duration-200",
                          isToday
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200",
                          booking ? "bg-yellow-100" : "bg-white",
                          isCellInSelection(room, day) &&
                            "bg-green-200 border-green-400",
                          isCellSelectionStart(room, day) &&
                            "bg-green-300 border-green-500",
                          isCellSelectionEnd(room, day) &&
                            "bg-green-300 border-green-500",
                          !booking && "hover:bg-gray-50",
                        )}
                        onClick={() => handleCellClick(room, day)}
                      >
                        {booking && (
                          <div className="text-xs h-full flex flex-col relative">
                            {/* Time-based fill indicator */}
                            <div className="absolute inset-0 flex">
                              {/* Morning fill */}
                              <div
                                className={cn(
                                  "flex-1 opacity-30",
                                  booking.checkInTime === "09:00" ||
                                    booking.checkOutTime === "09:00"
                                    ? "bg-yellow-300"
                                    : "bg-transparent",
                                )}
                              />
                              {/* Afternoon fill */}
                              <div
                                className={cn(
                                  "flex-1 opacity-30",
                                  booking.checkInTime === "14:00" ||
                                    booking.checkOutTime === "12:00" ||
                                    booking.checkOutTime === "14:00"
                                    ? "bg-yellow-400"
                                    : "bg-transparent",
                                )}
                              />
                              {/* Evening fill */}
                              <div
                                className={cn(
                                  "flex-1 opacity-30",
                                  booking.checkInTime === "18:00" ||
                                    booking.checkOutTime === "18:00"
                                    ? "bg-yellow-500"
                                    : "bg-transparent",
                                )}
                              />
                            </div>

                            {room.type === "single" ||
                            !booking.secondGuestName ? (
                              // Single guest display
                              <>
                                <div
                                  className={cn(
                                    "font-semibold truncate flex-1 flex items-center justify-center relative z-10",
                                    booking.guestGender === "female"
                                      ? "text-pink-700 bg-pink-100/80"
                                      : "text-blue-700 bg-blue-100/80",
                                  )}
                                >
                                  {booking.guestName.split(" ")[0]}
                                </div>
                                <div className="text-gray-600 text-[8px] absolute bottom-0 right-0 z-10 bg-white px-1 rounded">
                                  {booking.duration}д
                                </div>
                                <div className="text-gray-500 text-[7px] absolute top-0 right-0 z-10 bg-white px-1 rounded">
                                  {booking.checkInTime}-{booking.checkOutTime}
                                </div>
                              </>
                            ) : (
                              // Double guest display - split horizontally with clear separation
                              <>
                                <div className="h-full flex flex-col relative z-10">
                                  <div
                                    className={cn(
                                      "font-semibold truncate text-[9px] flex-1 flex items-center justify-center border-b-2",
                                      booking.guestGender === "female"
                                        ? "text-pink-800 bg-pink-100/80 border-pink-300"
                                        : "text-blue-800 bg-blue-100/80 border-blue-300",
                                    )}
                                  >
                                    {booking.guestName.split(" ")[0]}
                                  </div>
                                  <div
                                    className={cn(
                                      "font-semibold truncate text-[9px] flex-1 flex items-center justify-center",
                                      booking.secondGuestGender === "female"
                                        ? "text-pink-800 bg-pink-200/80"
                                        : "text-blue-800 bg-blue-200/80",
                                    )}
                                  >
                                    {booking.secondGuestName?.split(" ")[0]}
                                  </div>
                                </div>
                                <div className="text-gray-700 text-[7px] absolute bottom-0 right-0 bg-white px-1 rounded z-10">
                                  {booking.duration}д
                                </div>
                                <div className="text-gray-500 text-[6px] absolute top-0 right-0 bg-white px-1 rounded z-10">
                                  {booking.checkInTime}-{booking.checkOutTime}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        {!booking && room.status === "available" && (
                          <div className="text-xs text-gray-400 text-center pt-4">
                            {isCellInSelection(room, day)
                              ? "Выбрано"
                              : "Свободно"}
                          </div>
                        )}

                        {isCellInSelection(room, day) && (
                          <div className="absolute top-1 right-1">
                            <Calendar className="w-3 h-3 text-green-600" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions and Legend */}
      <div className="mt-4 space-y-3">
        {isSelecting && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                Выберите конечную дату для бронирования
              </span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              Начальная дата: {selectionStart?.date.toLocaleDateString("ru-RU")}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
            <span>Свободно</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Забронировано</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
            <span>Выбранный период</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-400 rounded"></div>
            <span>Сегодня</span>
          </div>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          💡 Совет: Кликните на свободную ячейку для начала выбора периода,
          затем кликните на конечную дату для завершения выбора.
        </div>
      </div>
    </div>
  );
}
