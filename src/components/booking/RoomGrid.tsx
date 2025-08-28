import { useState, useRef } from "react";
import { Room, Booking, Guest } from "@/types/booking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  FileText,
  User,
  Printer,
  Calendar,
  Clock,
  LogIn,
  LogOut,
} from "lucide-react";

interface RoomGridProps {
  rooms?: Room[];
  bookings?: Booking[];
  guests?: Guest[];
  selectedFloor?: number;
  selectedBuilding?: string;
  onRoomClick: (room: Room) => void;
  onRoomDoubleClick?: (room: Room) => void;
  onContextMenuAction?: (action: string, room: Room) => void;
  selectedRoom?: Room | null;
  selectedDates?: Date[];
  onDateSelection?: (room: Room, dates: Date[]) => void;
}

const getRoomStatusColor = (status: Room["status"]) => {
  switch (status) {
    case "available":
      return "bg-green-100 border-green-300 hover:bg-green-200";
    case "occupied":
      return "bg-red-100 border-red-300 hover:bg-red-200";
    case "booked":
      return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
    case "reserved":
      return "bg-blue-100 border-blue-300 hover:bg-blue-200";
    case "blocked":
      return "bg-gray-400 border-gray-600 hover:bg-gray-500 text-white";
    default:
      return "bg-gray-100 border-gray-300";
  }
};

const getRoomTypeIcon = (type: Room["type"]) => {
  switch (type) {
    case "single":
      return "1";
    case "double":
      return "2";
    case "double_with_balcony":
      return "2+";
    case "luxury":
      return "L";
    default:
      return "?";
  }
};

const getRoomCapacity = (type: Room["type"]) => {
  switch (type) {
    case "single":
      return 1;
    case "double":
    case "double_with_balcony":
      return 2;
    case "luxury":
      return 3;
    default:
      return 1;
  }
};

export default function RoomGrid({
  rooms = [],
  bookings = [],
  guests = [],
  selectedFloor = 1,
  selectedBuilding = "A",
  onRoomClick = () => {},
  onRoomDoubleClick = () => {},
  onContextMenuAction = () => {},
  selectedRoom = null,
  selectedDates = [],
  onDateSelection = () => {},
}: RoomGridProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    room: Room;
    date: Date;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const floorRooms = rooms.filter(
    (room) =>
      room.floor === selectedFloor && room.building === selectedBuilding,
  );

  // Create 8x8 grid
  const gridRooms = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  floorRooms.forEach((room) => {
    if (room.position.row < 8 && room.position.col < 8) {
      gridRooms[room.position.row][room.position.col] = room;
    }
  });

  // Get guest name for room
  const getGuestName = (roomId: string) => {
    const activeBooking = bookings.find(
      (booking) =>
        booking.roomId === roomId &&
        (booking.status === "active" || booking.status === "checked_in"),
    );
    return activeBooking ? activeBooking.guestName : null;
  };

  // Get occupancy info for room
  const getRoomOccupancy = (room: Room) => {
    const capacity = getRoomCapacity(room.type);
    const activeBookings = bookings.filter(
      (booking) =>
        booking.roomId === room.id &&
        (booking.status === "active" || booking.status === "checked_in"),
    );

    const guestInfo = activeBookings.map((b) => ({
      name: b.guestName,
      gender: b.guestGender,
      secondGuest: b.secondGuestName
        ? {
            name: b.secondGuestName,
            gender: b.secondGuestGender,
          }
        : null,
    }));

    let totalGuests = 0;
    guestInfo.forEach((info) => {
      totalGuests += 1;
      if (info.secondGuest) totalGuests += 1;
    });

    return {
      occupied: totalGuests,
      capacity: capacity,
      guests: activeBookings.map((b) => b.guestName),
      guestInfo: guestInfo,
    };
  };

  // Handle room context menu actions
  const handleContextAction = (action: string, room: Room) => {
    onContextMenuAction(action, room);
  };

  // Handle room double click
  const handleDoubleClick = (room: Room) => {
    onRoomDoubleClick(room);
  };

  return (
    <div className="bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          Корпус {selectedBuilding}, Этаж {selectedFloor}
        </h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Свободно</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Занято</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Забронировано</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Резерв</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 border border-gray-600 rounded"></div>
            <span>Заблокирован</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1 max-w-3xl">
        {gridRooms.map((row, rowIndex) =>
          row.map((room, colIndex) => {
            if (!room) {
              return (
                <div
                  key={`empty-${rowIndex}-${colIndex}`}
                  className="w-16 h-16 border border-dashed border-gray-200 rounded"
                />
              );
            }

            const occupancy = getRoomOccupancy(room);
            const activeBooking = bookings.find(
              (booking) =>
                booking.roomId === room.id &&
                (booking.status === "active" ||
                  booking.status === "checked_in"),
            );

            return (
              <ContextMenu key={room.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className={cn(
                      "w-16 h-16 cursor-pointer transition-all duration-200 border-2 relative overflow-hidden rounded flex flex-col",
                      getRoomStatusColor(room.status),
                      selectedRoom?.id === room.id &&
                        "ring-2 ring-blue-500 ring-offset-1",
                    )}
                    onClick={() => onRoomClick(room)}
                    onDoubleClick={() => handleDoubleClick(room)}
                  >
                    {/* Room header */}
                    <div className="flex-1 flex flex-col items-center justify-center p-1">
                      <div className="text-xs font-bold leading-none">
                        {room.number}
                      </div>
                      <div className="text-[10px] text-gray-600 leading-none">
                        {getRoomTypeIcon(room.type)}
                      </div>
                    </div>

                    {/* Occupancy visualization */}
                    {occupancy.capacity > 1 && (
                      <div className="h-3 flex border-t border-gray-300">
                        {Array.from({ length: occupancy.capacity }).map(
                          (_, index) => {
                            let dotColor = "bg-green-100 text-green-600";
                            let isOccupied = false;

                            // Determine dot color based on guest gender
                            if (index < occupancy.guestInfo.length) {
                              const guestInfo = occupancy.guestInfo[0];
                              if (index === 0) {
                                isOccupied = true;
                                dotColor =
                                  guestInfo.gender === "female"
                                    ? "bg-pink-200 text-pink-800"
                                    : "bg-blue-200 text-blue-800";
                              } else if (index === 1 && guestInfo.secondGuest) {
                                isOccupied = true;
                                dotColor =
                                  guestInfo.secondGuest.gender === "female"
                                    ? "bg-pink-200 text-pink-800"
                                    : "bg-blue-200 text-blue-800";
                              }
                            }

                            return (
                              <div
                                key={index}
                                className={cn(
                                  "flex-1 text-[10px] flex items-center justify-center font-bold",
                                  dotColor,
                                  index > 0 && "border-l border-gray-300",
                                )}
                              >
                                {isOccupied ? "●" : "○"}
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}

                    {/* Single occupancy indicator */}
                    {occupancy.capacity === 1 && (
                      <div className="h-2 border-t border-gray-300">
                        <div
                          className={cn(
                            "h-full w-full",
                            occupancy.occupied > 0
                              ? "bg-red-200"
                              : "bg-green-100",
                          )}
                        />
                      </div>
                    )}

                    {/* Guest names tooltip area */}
                    {occupancy.guests.length > 0 && (
                      <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/80 text-white text-[8px] p-1 flex flex-col justify-center items-center transition-opacity">
                        {occupancy.guests.slice(0, 2).map((guest, idx) => (
                          <div
                            key={idx}
                            className="truncate max-w-full text-center leading-tight"
                          >
                            {guest.split(" ").slice(0, 2).join(" ")}
                          </div>
                        ))}
                        {occupancy.guests.length > 2 && (
                          <div className="text-[7px]">
                            +{occupancy.guests.length - 2}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Half-day indicator */}
                    {activeBooking?.isHalfDay && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-bl" />
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
            );
          }),
        )}
      </div>
    </div>
  );
}
