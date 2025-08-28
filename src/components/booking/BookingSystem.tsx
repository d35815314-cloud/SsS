import { useState } from "react";
import { Room, Booking, Guest, Organization } from "@/types/booking";
import { rooms } from "@/data/rooms";
import RoomGrid from "./RoomGrid";
import CalendarView from "./CalendarView";
import BookingDialog from "./BookingDialog";
import BookingDetailsDialog from "./BookingDetailsDialog";
import GuestCard from "../guest/GuestCard";
import OrganizationCard from "../organization/OrganizationCard";
import BlockRoomDialog from "./BlockRoomDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Building,
  Users,
  Calendar,
  Filter,
  Grid,
  CalendarDays,
  Settings,
  Moon,
  FileText,
  UserPlus,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BookingSystem() {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedBuilding, setSelectedBuilding] = useState("A");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(false);
  const [isGuestCardOpen, setIsGuestCardOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [guestSearchTerm, setGuestSearchTerm] = useState("");
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roomsData, setRoomsData] = useState(rooms);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("calendar");
  const [activeTab, setActiveTab] = useState("placement");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isOrganizationCardOpen, setIsOrganizationCardOpen] = useState(false);
  const [isBlockRoomDialogOpen, setIsBlockRoomDialogOpen] = useState(false);
  const [reportDateFrom, setReportDateFrom] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportDateTo, setReportDateTo] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isNewGuestDialogOpen, setIsNewGuestDialogOpen] = useState(false);
  const [isNewOrganizationDialogOpen, setIsNewOrganizationDialogOpen] =
    useState(false);
  const [isNewBookingDialogOpen, setIsNewBookingDialogOpen] = useState(false);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    if (room.status === "available") {
      setIsBookingDialogOpen(true);
    }
  };

  const handleRoomDoubleClick = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingDetailsOpen(true);
  };

  const handleContextMenuAction = (action: string, room: Room) => {
    setSelectedRoom(room);

    switch (action) {
      case "checkin":
        if (room.status === "available") {
          setIsBookingDialogOpen(true);
        }
        break;
      case "checkout":
        // Handle checkout logic
        console.log("Checkout room:", room.number);
        break;
      case "booking":
        // Open booking details for room
        const roomBooking = bookings.find(
          (b) =>
            b.roomId === room.id &&
            (b.status === "active" || b.status === "checked_in"),
        );
        if (roomBooking) {
          setSelectedRoom(room);
          setIsBookingDetailsOpen(true);
        }
        break;
      case "guest":
        // Show guest card
        const booking = bookings.find(
          (b) =>
            b.roomId === room.id &&
            (b.status === "active" || b.status === "checked_in"),
        );
        if (booking) {
          const guest = guests.find((g) => g.id === booking.guestId);
          if (guest) {
            setSelectedGuest(guest);
            setIsGuestCardOpen(true);
          }
        }
        break;
      case "report":
        // Print report
        console.log("Print report for room:", room.number);
        break;

      case "block":
        // Block/unblock room
        setSelectedRoom(room);
        setIsBlockRoomDialogOpen(true);
        break;
    }
  };

  const handleBlockRoom = (roomId: string, reason: string) => {
    setRoomsData((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              status: "blocked" as const,
              blockReason: reason,
              blockedAt: new Date(),
            }
          : room,
      ),
    );
  };

  const handleUnblockRoom = (roomId: string) => {
    setRoomsData((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              status: "available" as const,
              blockReason: undefined,
              blockedAt: undefined,
            }
          : room,
      ),
    );
  };

  const handleNightAudit = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);

    // Generate night audit report
    const auditData = {
      date: currentDate.toLocaleDateString("ru-RU"),
      nextDate: nextDay.toLocaleDateString("ru-RU"),
      totalRooms: roomsData.length,
      availableRooms: roomsData.filter((r) => r.status === "available").length,
      occupiedRooms: roomsData.filter((r) => r.status === "occupied").length,
      bookedRooms: roomsData.filter((r) => r.status === "booked").length,
      blockedRooms: roomsData.filter((r) => r.status === "blocked").length,
      activeBookings: bookings.filter(
        (b) => b.status === "active" || b.status === "checked_in",
      ).length,
      checkInsToday: bookings.filter(
        (b) =>
          b.checkInDate.toDateString() === currentDate.toDateString() &&
          (b.status === "active" || b.status === "checked_in"),
      ).length,
      checkOutsToday: bookings.filter(
        (b) =>
          b.checkOutDate.toDateString() === currentDate.toDateString() &&
          (b.status === "active" || b.status === "checked_in"),
      ).length,
      totalGuests: guests.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    };

    // Generate and print night audit report
    const reportContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ночной аудит - ${auditData.date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 5px; }
            .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .summary { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>НОЧНОЙ АУДИТ САНАТОРИЯ "ДНЕСТР"</h1>
          
          <div class="header">
            <div>
              <strong>Дата аудита:</strong> ${auditData.date}<br>
              <strong>Следующий день:</strong> ${auditData.nextDate}<br>
              <strong>Время создания:</strong> ${new Date().toLocaleString("ru-RU")}
            </div>
            <div style="text-align: right;">
              <strong>Система управления санаторием</strong><br>
              <em>Автоматический отчет</em>
            </div>
          </div>

          <div class="section">
            <h2>ОБЩАЯ СТАТИСТИКА</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${auditData.totalRooms}</div>
                <div class="stat-label">Всего номеров</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${auditData.availableRooms}</div>
                <div class="stat-label">Свободно</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${auditData.occupiedRooms}</div>
                <div class="stat-label">Занято</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${auditData.bookedRooms}</div>
                <div class="stat-label">Забронировано</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>ДВИЖЕНИЕ ГОСТЕЙ</h2>
            <table>
              <tr>
                <th>Показатель</th>
                <th>Количество</th>
                <th>Примечание</th>
              </tr>
              <tr>
                <td>Заезды на ${auditData.date}</td>
                <td>${auditData.checkInsToday}</td>
                <td>Гости, заселившиеся сегодня</td>
              </tr>
              <tr>
                <td>Выезды на ${auditData.date}</td>
                <td>${auditData.checkOutsToday}</td>
                <td>Гости, выехавшие сегодня</td>
              </tr>
              <tr>
                <td>Активные бронирования</td>
                <td>${auditData.activeBookings}</td>
                <td>Текущие активные брони</td>
              </tr>
              <tr>
                <td>Всего гостей в базе</td>
                <td>${auditData.totalGuests}</td>
                <td>Общее количество гостей</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h2>СОСТОЯНИЕ НОМЕРОВ ПО КОРПУСАМ</h2>
            <table>
              <tr>
                <th>Корпус</th>
                <th>Всего номеров</th>
                <th>Свободно</th>
                <th>Занято</th>
                <th>Забронировано</th>
                <th>Заблокировано</th>
              </tr>
              <tr>
                <td>Корпус A</td>
                <td>${roomsData.filter((r) => r.building === "A").length}</td>
                <td>${roomsData.filter((r) => r.building === "A" && r.status === "available").length}</td>
                <td>${roomsData.filter((r) => r.building === "A" && r.status === "occupied").length}</td>
                <td>${roomsData.filter((r) => r.building === "A" && r.status === "booked").length}</td>
                <td>${roomsData.filter((r) => r.building === "A" && r.status === "blocked").length}</td>
              </tr>
              <tr>
                <td>Корпус B</td>
                <td>${roomsData.filter((r) => r.building === "B").length}</td>
                <td>${roomsData.filter((r) => r.building === "B" && r.status === "available").length}</td>
                <td>${roomsData.filter((r) => r.building === "B" && r.status === "occupied").length}</td>
                <td>${roomsData.filter((r) => r.building === "B" && r.status === "booked").length}</td>
                <td>${roomsData.filter((r) => r.building === "B" && r.status === "blocked").length}</td>
              </tr>
            </table>
          </div>

          <div class="summary">
            <h2>ИТОГИ ДНЯ</h2>
            <p><strong>Загруженность:</strong> ${Math.round(((auditData.occupiedRooms + auditData.bookedRooms) / auditData.totalRooms) * 100)}%</p>
            <p><strong>Общая выручка:</strong> ${auditData.totalRevenue.toLocaleString()} ₽</p>
            <p><strong>Статус системы:</strong> Все операции завершены успешно</p>
            <p><strong>Следующий аудит:</strong> ${auditData.nextDate} в 00:00</p>
          </div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    // Update room statuses and bookings for next day
    console.log("Night audit completed for:", nextDay.toLocaleDateString());
  };

  const handleDateRangeSelect = (
    room: Room,
    startDate: Date,
    endDate: Date,
  ) => {
    const duration =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1; // +1 to include both start and end dates

    // Create a booking with the selected date range
    const bookingData = {
      roomId: room.id,
      guestName: "Новый гость", // This will be filled in the dialog
      guestPhone: "",
      guestAge: 0,
      guestAddress: "",
      checkInDate: startDate,
      checkOutDate: endDate,
      duration,
      status: "active" as const,
    };

    setSelectedRoom(room);
    setIsBookingDialogOpen(true);
  };

  const handleBookRoom = (bookingData: Omit<Booking, "id" | "createdAt">) => {
    const bookingId = `booking-${Date.now()}`;
    const guestId = `guest-${Date.now()}`;
    const folioNumber = `F${Date.now().toString().slice(-6)}`;

    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      guestId: guestId,
      createdAt: new Date(),
    };

    // Create guest if not exists
    const newGuest: Guest = {
      id: guestId,
      firstName: bookingData.guestName.split(" ")[0] || "",
      lastName: bookingData.guestName.split(" ")[1] || "",
      fullName: bookingData.guestName,
      phone: bookingData.guestPhone,
      age: bookingData.guestAge,
      dateOfBirth: new Date(
        new Date().getFullYear() - bookingData.guestAge,
        0,
        1,
      ),
      address: bookingData.guestAddress,
      passportNumber: `${Math.random().toString().slice(2, 12)}`,
      gender: bookingData.guestGender,
      createdAt: new Date(),
    };

    setBookings([...bookings, newBooking]);
    setGuests([...guests, newGuest]);

    // Update room status - check if room has capacity for more guests
    setRoomsData((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === bookingData.roomId) {
          const currentBookings =
            bookings.filter(
              (b) =>
                b.roomId === room.id &&
                (b.status === "active" || b.status === "checked_in"),
            ).length + 1; // +1 for the new booking

          const newOccupancy = currentBookings;
          const newStatus =
            newOccupancy >= (room.capacity || 2) ? "occupied" : "booked";

          return {
            ...room,
            status: newStatus as const,
            currentOccupancy: newOccupancy,
          };
        }
        return room;
      }),
    );
  };

  const handleUpdateBooking = (updatedBooking: Booking) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking,
      ),
    );
  };

  const handleCheckOut = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.id === bookingId ? { ...b, status: "completed" } : b,
        ),
      );

      setRoomsData((prevRooms) =>
        prevRooms.map((room) =>
          room.id === booking.roomId
            ? { ...room, status: "available", currentOccupancy: 0 }
            : room,
        ),
      );
    }
  };

  const handleEarlyCheckOut = (bookingId: string) => {
    handleCheckOut(bookingId);
  };

  const handleExtendStay = (bookingId: string, newCheckOutDate: Date) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) => {
        if (booking.id === bookingId) {
          const duration = Math.ceil(
            (newCheckOutDate.getTime() - booking.checkInDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          return {
            ...booking,
            checkOutDate: newCheckOutDate,
            duration,
          };
        }
        return booking;
      }),
    );
  };

  const handleTransferRoom = (bookingId: string, newRoomId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      // Free up old room
      setRoomsData((prevRooms) =>
        prevRooms.map((room) =>
          room.id === booking.roomId
            ? { ...room, status: "available", currentOccupancy: 0 }
            : room.id === newRoomId
              ? { ...room, status: "occupied", currentOccupancy: 1 }
              : room,
        ),
      );

      // Update booking
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.id === bookingId ? { ...b, roomId: newRoomId } : b,
        ),
      );
    }
  };

  const handleNewBooking = (guestId?: string) => {
    // Open booking dialog with guest pre-filled if provided
    setSelectedRoom(null);
    setIsNewBookingDialogOpen(true);
  };

  const handleAddNewGuest = () => {
    setIsNewGuestDialogOpen(true);
  };

  const handleAddNewOrganization = () => {
    setIsNewOrganizationDialogOpen(true);
  };

  const handleCreateGuest = (guestData: Omit<Guest, "id" | "createdAt">) => {
    const guestId = `guest-${Date.now()}`;
    const newGuest: Guest = {
      ...guestData,
      id: guestId,
      createdAt: new Date(),
    };
    setGuests([...guests, newGuest]);
    setIsNewGuestDialogOpen(false);
  };

  const handleCreateOrganization = (
    orgData: Omit<Organization, "id" | "createdAt">,
  ) => {
    const orgId = `org-${Date.now()}`;
    const newOrganization: Organization = {
      ...orgData,
      id: orgId,
      createdAt: new Date(),
    };
    setOrganizations([...organizations, newOrganization]);
    setIsNewOrganizationDialogOpen(false);
  };

  // Auto checkout functionality
  const checkAutoCheckouts = () => {
    const now = new Date();
    const expiredBookings = bookings.filter(
      (booking) =>
        (booking.status === "active" || booking.status === "checked_in") &&
        booking.checkOutDate <= now,
    );

    expiredBookings.forEach((booking) => {
      handleCheckOut(booking.id);
    });
  };

  // Run auto checkout check periodically
  useState(() => {
    const interval = setInterval(checkAutoCheckouts, 60000); // Check every minute
    return () => clearInterval(interval);
  });

  // Filter rooms based on search and filters
  const filteredRooms = roomsData.filter((room) => {
    const matchesSearch =
      searchTerm === "" ||
      room.number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    const matchesBuilding = room.building === selectedBuilding;

    return matchesSearch && matchesStatus && matchesType && matchesBuilding;
  });

  // Filter guests
  const filteredGuests = guests
    .filter((guest) => {
      return (
        guestSearchTerm === "" ||
        guest.fullName.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
        guest.phone.includes(guestSearchTerm) ||
        guest.passportNumber.includes(guestSearchTerm)
      );
    })
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  // Filter organizations
  const filteredOrganizations = organizations
    .filter((org) => {
      return (
        organizationSearchTerm === "" ||
        org.officialName
          .toLowerCase()
          .includes(organizationSearchTerm.toLowerCase()) ||
        org.unofficialName
          ?.toLowerCase()
          .includes(organizationSearchTerm.toLowerCase()) ||
        org.contactPersonName
          .toLowerCase()
          .includes(organizationSearchTerm.toLowerCase()) ||
        org.contactPhone.includes(organizationSearchTerm) ||
        org.contractNumber.includes(organizationSearchTerm)
      );
    })
    .sort((a, b) => a.officialName.localeCompare(b.officialName));

  const getStats = () => {
    const total = roomsData.length;
    const available = roomsData.filter((r) => r.status === "available").length;
    const occupied = roomsData.filter((r) => r.status === "occupied").length;
    const booked = roomsData.filter((r) => r.status === "booked").length;
    const reserved = roomsData.filter((r) => r.status === "reserved").length;

    // Stats by building
    const buildingA = roomsData.filter((r) => r.building === "A");
    const buildingB = roomsData.filter((r) => r.building === "B");

    return {
      total,
      available,
      occupied,
      booked,
      reserved,
      buildingA: buildingA.length,
      buildingB: buildingB.length,
    };
  };

  const stats = getStats();

  const handleExportReport = (
    reportType: "occupancy" | "guests" | "status_by_date",
    format: "xlsx" | "pdf" | "docx",
    filters?: {
      floor?: number;
      building?: string;
      roomType?: string;
      date?: Date;
      dateRange?: { start: Date; end: Date };
    },
  ) => {
    // Create sample data based on report type
    let data: any[] = [];
    let filename = "";
    let filteredRooms = roomsData;

    // Apply filters
    if (filters) {
      if (filters.floor) {
        filteredRooms = filteredRooms.filter(
          (room) => room.floor === filters.floor,
        );
      }
      if (filters.building) {
        filteredRooms = filteredRooms.filter(
          (room) => room.building === filters.building,
        );
      }
      if (filters.roomType && filters.roomType !== "all") {
        filteredRooms = filteredRooms.filter(
          (room) => room.type === filters.roomType,
        );
      }
      if (filters.dateRange) {
        // Filter bookings by date range
        const filteredBookings = bookings.filter(
          (booking) =>
            booking.checkInDate >= filters.dateRange.start &&
            booking.checkOutDate <= filters.dateRange.end,
        );
        // Use filtered bookings for report data
      }
    }

    switch (reportType) {
      case "occupancy":
        data = filteredRooms.map((room) => ({
          Номер: room.number,
          Тип: getRoomTypeText(room.type),
          Статус: getStatusText(room.status),
          Этаж: room.floor,
          Корпус: room.building,
          Вместимость: room.capacity || 2,
          "Текущая заполненность": room.currentOccupancy || 0,
        }));
        filename = `occupancy_report_${new Date().toISOString().split("T")[0]}`;
        break;

      case "guests":
        data = guests.map((guest) => ({
          ФИО: guest.fullName,
          Телефон: guest.phone,
          Возраст: guest.age,
          Пол: guest.gender === "male" ? "Мужской" : "Женский",
          Адрес: guest.address,
          Паспорт: guest.passportNumber,
          "Дата регистрации": guest.createdAt.toLocaleDateString("ru-RU"),
        }));
        filename = `guests_report_${new Date().toISOString().split("T")[0]}`;
        break;
      case "status_by_date":
        const reportDate = filters?.date || new Date();
        data = filteredRooms.map((room) => {
          const booking = bookings.find(
            (b) =>
              b.roomId === room.id &&
              b.checkInDate <= reportDate &&
              b.checkOutDate >= reportDate &&
              (b.status === "active" || b.status === "checked_in"),
          );

          let status = "Свободен";
          let guestInfo = "";

          if (booking) {
            if (
              booking.checkInDate.toDateString() === reportDate.toDateString()
            ) {
              status = "К заселению";
            } else if (
              booking.checkOutDate.toDateString() === reportDate.toDateString()
            ) {
              status = "На выселение";
            } else if (booking.status === "checked_in") {
              status = "Заселен";
            } else {
              status = "Забронирован";
            }
            guestInfo = booking.guestName;
            if (booking.secondGuestName) {
              guestInfo += ` + ${booking.secondGuestName}`;
            }
          }

          return {
            Номер: room.number,
            Тип: getRoomTypeText(room.type),
            Статус: status,
            Этаж: room.floor,
            Корпус: room.building,
            Гость: guestInfo,
            Заполненность: booking
              ? `${room.currentOccupancy || 1}/${room.capacity || 2}`
              : "0/" + (room.capacity || 2),
          };
        });
        filename = `status_report_${reportDate.toISOString().split("T")[0]}`;
        break;
    }

    // Export logic based on format
    if (format === "xlsx") {
      exportToExcel(data, filename);
    } else if (format === "pdf") {
      exportToPDF(data, filename, reportType);
    } else if (format === "docx") {
      exportToWord(data, filename, reportType);
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    // Create CSV content
    if (data.length === 0) {
      alert("Нет данных для экспорта");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(","),
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToPDF = (data: any[], filename: string, reportType: string) => {
    // Create HTML content for PDF
    const reportTitle =
      reportType === "occupancy"
        ? "Отчет по занятости"
        : reportType === "guests"
          ? "Отчет по гостям"
          : "Отчет по состоянию на дату";

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .date { text-align: right; margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="date">Дата создания: ${new Date().toLocaleDateString("ru-RU")}</div>
          <h1>${reportTitle}</h1>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0] || {})
                  .map((key) => `<th>${key}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) =>
                    `<tr>${Object.values(row)
                      .map((value) => `<td>${value || ""}</td>`)
                      .join("")}</tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const exportToWord = (data: any[], filename: string, reportType: string) => {
    // Create HTML content that can be saved as .doc
    const reportTitle =
      reportType === "occupancy"
        ? "Отчет по занятости"
        : reportType === "guests"
          ? "Отчет по гостям"
          : "Отчет по состоянию на дату";

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
          <meta charset='utf-8'>
          <title>${reportTitle}</title>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <p>Дата создания: ${new Date().toLocaleDateString("ru-RU")}</p>
          <table border='1' style='border-collapse: collapse; width: 100%;'>
            <thead>
              <tr>
                ${Object.keys(data[0] || {})
                  .map(
                    (key) =>
                      `<th style='padding: 8px; background-color: #f2f2f2;'>${key}</th>`,
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) =>
                    `<tr>${Object.values(row)
                      .map(
                        (value) =>
                          `<td style='padding: 8px;'>${value || ""}</td>`,
                      )
                      .join("")}</tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.doc`;
    link.click();
  };

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
      case "maintenance":
        return "Обслуживание";
      case "cleaning":
        return "Уборка";
      default:
        return status;
    }
  };

  // Simple form components
  const NewGuestForm = ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (data: Omit<Guest, "id" | "createdAt">) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      middleName: "",
      phone: "",
      email: "",
      age: "",
      address: "",
      passportNumber: "",
      gender: "male" as "male" | "female",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.phone ||
        !formData.age ||
        !formData.address ||
        !formData.passportNumber
      ) {
        alert("Пожалуйста, заполните все обязательные поля");
        return;
      }

      const fullName =
        `${formData.lastName} ${formData.firstName} ${formData.middleName || ""}`.trim();
      const age = parseInt(formData.age);
      const dateOfBirth = new Date();
      dateOfBirth.setFullYear(dateOfBirth.getFullYear() - age);

      onSubmit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        age,
        dateOfBirth,
        address: formData.address,
        passportNumber: formData.passportNumber,
        gender: formData.gender,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Имя *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Фамилия *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="middleName">Отчество</Label>
          <Input
            id="middleName"
            value={formData.middleName}
            onChange={(e) =>
              setFormData({ ...formData, middleName: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="age">Возраст *</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="address">Адрес *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passport">Номер паспорта *</Label>
            <Input
              id="passport"
              value={formData.passportNumber}
              onChange={(e) =>
                setFormData({ ...formData, passportNumber: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="gender">Пол *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value: "male" | "female") =>
                setFormData({ ...formData, gender: value })
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
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">Добавить гостя</Button>
        </div>
      </form>
    );
  };

  const NewOrganizationForm = ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (data: Omit<Organization, "id" | "createdAt">) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      officialName: "",
      unofficialName: "",
      contactPersonName: "",
      contactPhone: "",
      contractNumber: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !formData.officialName ||
        !formData.contactPersonName ||
        !formData.contactPhone ||
        !formData.contractNumber
      ) {
        alert("Пожалуйста, заполните все обязательные поля");
        return;
      }

      onSubmit({
        officialName: formData.officialName,
        unofficialName: formData.unofficialName || undefined,
        contactPersonName: formData.contactPersonName,
        contactPhone: formData.contactPhone,
        contractNumber: formData.contractNumber,
        issuedVouchers: [],
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="officialName">Официальное название *</Label>
          <Input
            id="officialName"
            value={formData.officialName}
            onChange={(e) =>
              setFormData({ ...formData, officialName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="unofficialName">Неофициальное название</Label>
          <Input
            id="unofficialName"
            value={formData.unofficialName}
            onChange={(e) =>
              setFormData({ ...formData, unofficialName: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactPerson">Контактное лицо *</Label>
            <Input
              id="contactPerson"
              value={formData.contactPersonName}
              onChange={(e) =>
                setFormData({ ...formData, contactPersonName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">Телефон *</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData({ ...formData, contactPhone: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="contractNumber">Номер договора *</Label>
          <Input
            id="contractNumber"
            value={formData.contractNumber}
            onChange={(e) =>
              setFormData({ ...formData, contractNumber: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">Добавить организацию</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Система управления санаторием &quot;Днестр&quot;
              </h1>
              <p className="text-gray-600 text-sm">
                {currentDate.toLocaleDateString("ru-RU", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Stats and Night Audit */}
            <div className="flex items-center gap-6">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-600">
                    Всего (A:{stats.buildingA} B:{stats.buildingB})
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {stats.available}
                  </div>
                  <div className="text-xs text-gray-600">Свободно</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">
                    {stats.occupied}
                  </div>
                  <div className="text-xs text-gray-600">Занято</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    {stats.booked}
                  </div>
                  <div className="text-xs text-gray-600">Забронировано</div>
                </div>
              </div>

              <Button
                onClick={handleNightAudit}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Moon className="w-4 h-4 mr-2" />
                Ночной аудит
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="placement" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Размещение
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Гости
            </TabsTrigger>
            <TabsTrigger
              value="organizations"
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Организации
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Бронь
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Отчеты
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* Placement Tab */}
          <TabsContent value="placement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controls Panel */}
              <div className="lg:col-span-1">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Управление
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* View Mode Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Режим просмотра
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={
                            viewMode === "calendar" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setViewMode("calendar")}
                          className="w-full"
                        >
                          <CalendarDays className="w-4 h-4 mr-1" />
                          Календарь
                        </Button>
                        <Button
                          variant={viewMode === "grid" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="w-full"
                        >
                          <Grid className="w-4 h-4 mr-1" />
                          Сетка
                        </Button>
                      </div>
                    </div>

                    {/* Building Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        Корпус
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["A", "B"].map((building) => (
                          <Button
                            key={building}
                            variant={
                              selectedBuilding === building
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedBuilding(building)}
                            className="w-full"
                          >
                            {building}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Floor Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Этаж
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5].map((floor) => (
                          <Button
                            key={floor}
                            variant={
                              selectedFloor === floor ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedFloor(floor)}
                            className="w-full"
                          >
                            {floor}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                        <Search className="w-4 h-4" />
                        Поиск номера
                      </label>
                      <Input
                        placeholder="Номер комнаты..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Статус
                      </label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Все статусы" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="available">Свободно</SelectItem>
                          <SelectItem value="occupied">Занято</SelectItem>
                          <SelectItem value="booked">Забронировано</SelectItem>
                          <SelectItem value="reserved">Резерв</SelectItem>
                          <SelectItem value="blocked">Заблокирован</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Тип номера
                      </label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Все типы" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все типы</SelectItem>
                          <SelectItem value="single">Одноместный</SelectItem>
                          <SelectItem value="double">Двухместный</SelectItem>
                          <SelectItem value="double_with_balcony">
                            С балконом
                          </SelectItem>
                          <SelectItem value="luxury">Люкс</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selected Room Info */}
                    {selectedRoom && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Выбранный номер</h4>
                        <div className="space-y-1 text-sm">
                          <div>Номер: {selectedRoom.number}</div>
                          <div>Этаж: {selectedRoom.floor}</div>
                          <div>Тип: {selectedRoom.type}</div>
                          <Badge variant="outline">{selectedRoom.status}</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Bookings */}
                {bookings.length > 0 && (
                  <Card className="bg-white mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Последние бронирования
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {bookings
                          .slice(-5)
                          .reverse()
                          .map((booking) => {
                            const room = roomsData.find(
                              (r) => r.id === booking.roomId,
                            );
                            return (
                              <div
                                key={booking.id}
                                className="text-sm border-b pb-2 last:border-b-0"
                              >
                                <div className="font-medium">
                                  {booking.guestName}
                                </div>
                                <div className="text-gray-600">
                                  Номер {room?.number}
                                </div>
                                <div className="text-gray-500">
                                  {booking.checkInDate.toLocaleDateString(
                                    "ru-RU",
                                  )}{" "}
                                  -{" "}
                                  {booking.checkOutDate.toLocaleDateString(
                                    "ru-RU",
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Room Display */}
              <div className="lg:col-span-3">
                {viewMode === "grid" ? (
                  <RoomGrid
                    rooms={filteredRooms}
                    selectedFloor={selectedFloor}
                    selectedBuilding={selectedBuilding}
                    onRoomClick={handleRoomClick}
                    onRoomDoubleClick={handleRoomDoubleClick}
                    onContextMenuAction={handleContextMenuAction}
                    selectedRoom={selectedRoom}
                    bookings={bookings}
                    guests={guests}
                  />
                ) : (
                  <CalendarView
                    rooms={filteredRooms}
                    bookings={bookings}
                    selectedFloor={selectedFloor}
                    selectedBuilding={selectedBuilding}
                    onRoomClick={handleRoomClick}
                    onBookRoom={handleBookRoom}
                    onDateRangeSelect={handleDateRangeSelect}
                    onContextMenuAction={handleContextMenuAction}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Guests Tab */}
          <TabsContent value="guests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Guest Search Panel */}
              <div className="lg:col-span-1">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Поиск гостей
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="guest-search">
                        Поиск по ФИО, телефону или паспорту
                      </Label>
                      <Input
                        id="guest-search"
                        placeholder="Введите данные для поиска..."
                        value={guestSearchTerm}
                        onChange={(e) => setGuestSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Всего гостей: {guests.length}</p>
                      <p>Найдено: {filteredGuests.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Guest List */}
              <div className="lg:col-span-3">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Список гостей
                      </div>
                      <Button size="sm" onClick={handleAddNewGuest}>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить гостя
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ФИО</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Возраст</TableHead>
                          <TableHead>Номер паспорта</TableHead>
                          <TableHead>Дата регистрации</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGuests.map((guest) => (
                          <TableRow key={guest.id}>
                            <TableCell className="font-medium">
                              {guest.fullName}
                            </TableCell>
                            <TableCell>{guest.phone}</TableCell>
                            <TableCell>{guest.age}</TableCell>
                            <TableCell>{guest.passportNumber}</TableCell>
                            <TableCell>
                              {guest.createdAt.toLocaleDateString("ru-RU")}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedGuest(guest);
                                  setIsGuestCardOpen(true);
                                }}
                              >
                                Просмотр
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Organization Search Panel */}
              <div className="lg:col-span-1">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Поиск организаций
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="organization-search">
                        Поиск по названию, контакту или договору
                      </Label>
                      <Input
                        id="organization-search"
                        placeholder="Введите данные для поиска..."
                        value={organizationSearchTerm}
                        onChange={(e) =>
                          setOrganizationSearchTerm(e.target.value)
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Всего организаций: {organizations.length}</p>
                      <p>Найдено: {filteredOrganizations.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Organization List */}
              <div className="lg:col-span-3">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Список организаций
                      </div>
                      <Button size="sm" onClick={handleAddNewOrganization}>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить организацию
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Официальное название</TableHead>
                          <TableHead>Неофициальное название</TableHead>
                          <TableHead>Контактное лицо</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Номер договора</TableHead>
                          <TableHead>Путевки</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrganizations.map((org) => (
                          <TableRow key={org.id}>
                            <TableCell className="font-medium">
                              {org.officialName}
                            </TableCell>
                            <TableCell>{org.unofficialName || "-"}</TableCell>
                            <TableCell>{org.contactPersonName}</TableCell>
                            <TableCell>{org.contactPhone}</TableCell>
                            <TableCell>{org.contractNumber}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {org.issuedVouchers.length}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrganization(org);
                                  setIsOrganizationCardOpen(true);
                                }}
                              >
                                Просмотр
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Booking Search Panel */}
              <div className="lg:col-span-1">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Поиск броней
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="booking-search">
                        Поиск по номеру, гостю или дате
                      </Label>
                      <Input
                        id="booking-search"
                        placeholder="Введите данные для поиска..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Всего броней: {bookings.length}</p>
                      <p>
                        Активных:{" "}
                        {bookings.filter((b) => b.status === "active").length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking List */}
              <div className="lg:col-span-3">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Список броней
                      </div>
                      <Button size="sm" onClick={handleNewBooking}>
                        <Plus className="w-4 h-4 mr-2" />
                        Создать бронь
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Номер</TableHead>
                          <TableHead>Гость</TableHead>
                          <TableHead>Заезд</TableHead>
                          <TableHead>Выезд</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Сумма</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => {
                          const room = roomsData.find(
                            (r) => r.id === booking.roomId,
                          );
                          return (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">
                                {room?.number || "N/A"}
                              </TableCell>
                              <TableCell>{booking.guestName}</TableCell>
                              <TableCell>
                                {booking.checkInDate.toLocaleDateString(
                                  "ru-RU",
                                )}
                              </TableCell>
                              <TableCell>
                                {booking.checkOutDate.toLocaleDateString(
                                  "ru-RU",
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {booking.status === "active"
                                    ? "Активна"
                                    : booking.status === "completed"
                                      ? "Завершена"
                                      : booking.status === "cancelled"
                                        ? "Отменена"
                                        : booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {booking.totalAmount
                                  ? `${booking.totalAmount.toLocaleString()} ₽`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const room = roomsData.find(
                                      (r) => r.id === booking.roomId,
                                    );
                                    if (room) {
                                      setSelectedRoom(room);
                                      setIsBookingDetailsOpen(true);
                                    }
                                  }}
                                >
                                  Просмотр
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Filters */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Параметры отчетов
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Корпус</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все корпуса</SelectItem>
                          <SelectItem value="A">Корпус A</SelectItem>
                          <SelectItem value="B">Корпус B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Этаж</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все этажи</SelectItem>
                          <SelectItem value="1">1 этаж</SelectItem>
                          <SelectItem value="2">2 этаж</SelectItem>
                          <SelectItem value="3">3 этаж</SelectItem>
                          <SelectItem value="4">4 этаж</SelectItem>
                          <SelectItem value="5">5 этаж</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Категория номеров</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все категории</SelectItem>
                          <SelectItem value="single">Одноместный</SelectItem>
                          <SelectItem value="double">Двухместный</SelectItem>
                          <SelectItem value="double_with_balcony">
                            С балконом
                          </SelectItem>
                          <SelectItem value="luxury">Люкс</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Период С</Label>
                      <Input
                        type="date"
                        value={reportDateFrom}
                        onChange={(e) => setReportDateFrom(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Период По</Label>
                      <Input
                        type="date"
                        value={reportDateTo}
                        onChange={(e) => setReportDateTo(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Types */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Типы отчетов
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Отчет по занятости</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Статистика занятости номеров с фильтрами
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportReport("occupancy", "xlsx", {
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          XLSX
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportReport("occupancy", "pdf", {
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportReport("occupancy", "docx", {
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          DOCX
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">
                        Отчет по состоянию на дату
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Статус номеров: свободные, забронированные, заселенные,
                        к заселению, на выселение
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportReport("status_by_date", "xlsx", {
                              date: new Date(),
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          XLSX
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportReport("status_by_date", "pdf", {
                              date: new Date(),
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportReport("status_by_date", "docx", {
                              date: new Date(),
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          DOCX
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Отчет по гостям</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Статистика по гостям и их проживанию
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportReport("guests", "xlsx", {
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          XLSX
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportReport("guests", "pdf", {
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportReport("guests", "docx", {
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          DOCX
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Управление номерами
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить номер
                    </Button>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Всего номеров: {roomsData.length}</p>
                    <p>Этажей: 5 в каждом корпусе</p>
                    <p>Корпусов: 2 (A, B)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Управление пользователями
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Добавить пользователя
                    </Button>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Управление ролями
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Администраторов: 1</p>
                    <p>Менеджеров: 2</p>
                    <p>Ресепшен: 3</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <BookingDialog
          room={selectedRoom}
          isOpen={isBookingDialogOpen}
          onClose={() => {
            setIsBookingDialogOpen(false);
            setSelectedRoom(null);
          }}
          onBookRoom={handleBookRoom}
        />

        <BookingDialog
          room={null}
          isOpen={isNewBookingDialogOpen}
          onClose={() => {
            setIsNewBookingDialogOpen(false);
          }}
          onBookRoom={handleBookRoom}
          rooms={roomsData}
          guests={guests}
        />

        <BookingDetailsDialog
          room={selectedRoom}
          booking={bookings.find(
            (b) =>
              b.roomId === selectedRoom?.id &&
              (b.status === "active" || b.status === "checked_in"),
          )}
          isOpen={isBookingDetailsOpen}
          onClose={() => {
            setIsBookingDetailsOpen(false);
            setSelectedRoom(null);
          }}
          onUpdateBooking={handleUpdateBooking}
          onCheckOut={handleCheckOut}
          onTransferRoom={handleTransferRoom}
          onExtendStay={handleExtendStay}
          onOpenGuestCard={(guestId) => {
            const guest = guests.find((g) => g.id === guestId);
            if (guest) {
              setSelectedGuest(guest);
              setIsGuestCardOpen(true);
            }
          }}
          rooms={roomsData}
        />

        <GuestCard
          guest={selectedGuest}
          bookings={bookings.filter((b) => b.guestId === selectedGuest?.id)}
          isOpen={isGuestCardOpen}
          onClose={() => {
            setIsGuestCardOpen(false);
            setSelectedGuest(null);
          }}
          onEarlyCheckOut={handleEarlyCheckOut}
          onExtendStay={handleExtendStay}
          onTransferRoom={handleTransferRoom}
          onNewBooking={handleNewBooking}
        />

        <OrganizationCard
          organization={selectedOrganization}
          isOpen={isOrganizationCardOpen}
          onClose={() => {
            setIsOrganizationCardOpen(false);
            setSelectedOrganization(null);
          }}
        />

        <BlockRoomDialog
          room={selectedRoom}
          isOpen={isBlockRoomDialogOpen}
          onClose={() => {
            setIsBlockRoomDialogOpen(false);
            setSelectedRoom(null);
          }}
          onBlockRoom={handleBlockRoom}
          onUnblockRoom={handleUnblockRoom}
        />

        {/* New Guest Dialog */}
        <Dialog
          open={isNewGuestDialogOpen}
          onOpenChange={setIsNewGuestDialogOpen}
        >
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Добавить нового гостя
              </DialogTitle>
            </DialogHeader>
            <NewGuestForm
              onSubmit={handleCreateGuest}
              onCancel={() => setIsNewGuestDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* New Organization Dialog */}
        <Dialog
          open={isNewOrganizationDialogOpen}
          onOpenChange={setIsNewOrganizationDialogOpen}
        >
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="w-6 h-6" />
                Добавить новую организацию
              </DialogTitle>
            </DialogHeader>
            <NewOrganizationForm
              onSubmit={handleCreateOrganization}
              onCancel={() => setIsNewOrganizationDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
