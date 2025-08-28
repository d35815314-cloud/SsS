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
import { Organization } from "@/types/booking";
import {
  Building,
  Phone,
  User,
  FileText,
  Ticket,
  Edit,
  Calendar,
} from "lucide-react";

interface OrganizationCardProps {
  organization?: Organization | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function OrganizationCard({
  organization = null,
  isOpen = false,
  onClose = () => {},
  onEdit = () => {},
}: OrganizationCardProps) {
  if (!organization) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6" />
              Карточка организации
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organization Information */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Информация об организации
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {organization.officialName.charAt(0)}
                </div>
                <h3 className="text-xl font-bold">
                  {organization.officialName}
                </h3>
                <p className="text-gray-600">
                  ID: {organization.id.slice(0, 8)}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">
                    Официальное название:
                  </span>
                  <div className="font-semibold">
                    {organization.officialName}
                  </div>
                </div>

                {organization.unofficialName && (
                  <div>
                    <span className="font-medium text-gray-600">
                      Неофициальное название:
                    </span>
                    <div className="font-semibold">
                      {organization.unofficialName}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Контактное лицо:
                  </span>
                  <div className="font-semibold">
                    {organization.contactPersonName}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Телефон:
                  </span>
                  <div className="font-semibold text-lg">
                    {organization.contactPhone}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Номер договора:
                  </span>
                  <div className="font-semibold">
                    {organization.contractNumber}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Дата создания:
                  </span>
                  <div className="font-semibold">
                    {organization.createdAt.toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vouchers Information */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Выданные путевки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600">
                  {organization.issuedVouchers.length}
                </div>
                <div className="text-sm text-gray-600">Всего путевок</div>
              </div>

              <Separator />

              {organization.issuedVouchers.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {organization.issuedVouchers.map((voucher, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{voucher}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Активна
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Ticket className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Путевки не выданы</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Ticket className="w-4 h-4 mr-2" />
              Выдать путевку
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              История договоров
            </Button>
            <Button>Печать отчета</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
