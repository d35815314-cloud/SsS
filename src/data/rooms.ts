import { Room } from "@/types/booking";

// Generate rooms for 2 buildings with 5 floors each (8x8 grid per floor)
export const generateRooms = (): Room[] => {
  const rooms: Room[] = [];
  const roomTypes: Room["type"][] = [
    "single",
    "double",
    "double_with_balcony",
    "luxury",
  ];
  const statuses: Room["status"][] = [
    "available",
    "occupied",
    "booked",
    "reserved",
  ];

  const buildings = ["A", "B"];

  buildings.forEach((building, buildingIndex) => {
    let roomNumber = buildingIndex === 0 ? 101 : 201;

    for (let floor = 1; floor <= 5; floor++) {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const roomType =
            roomTypes[Math.floor(Math.random() * roomTypes.length)];
          const room: Room = {
            id: `room-${building}-${floor}-${row}-${col}`,
            number: `${building}${roomNumber}`,
            type: roomType,
            status:
              Math.random() > 0.7
                ? statuses[Math.floor(Math.random() * 4)]
                : "available",
            floor,
            building,
            position: { row, col },
            capacity: roomType === "single" ? 1 : 2, // Максимум 2 человека
            pricePerNight:
              roomType === "luxury"
                ? 5000
                : roomType === "double_with_balcony"
                  ? 3500
                  : roomType === "double"
                    ? 3000
                    : 2500,
          };
          rooms.push(room);
          roomNumber++;
        }
      }
    }
  });

  return rooms;
};

export const rooms = generateRooms();
