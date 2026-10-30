

import NotFoundException from "@/exceptions/not-found-exception";
import { formatDate } from "@/lib/formate-date";
import { reminderRepository } from "@/repository/reminder-repository";
import { PostponeReminder } from "@/types/reminder";


export class ReminderService {
    static async getDashboard() {
        const reminders = await reminderRepository.findDashboard();// get all reminders

        return reminders.map((r) => ({// map to the required fields(na2i fields muhadadin ma tjib klshi) without map,ALL the tables that relations return 
            id: r.reminder_id,
            client_name: r.vehicle.client.name,
            client_id: r.vehicle.client.client_id,
            mobile_number: r.vehicle.client.mobile_number,
            make: r.vehicle.make,
            model: r.vehicle.model,
            plate_number: r.vehicle.plate_number,
            service_type: r.service_type.service_name,
            due_date: formatDate(r.due_date),
            contacted_date: r.contacted_date ? formatDate(r.contacted_date) : null,
        }));
    }

    static async markContacted(reminder_id: number) {
        const reminder = await reminderRepository.findById(reminder_id);
        if (!reminder) {
            throw new NotFoundException("Reminder not found");
        }
        const updated = await reminderRepository.markContacted(reminder_id);
        return {
            id: updated.reminder_id,
            client_name: updated.vehicle.client.name,
            mobile_number: updated.vehicle.client.mobile_number,
            plate_number: updated.vehicle.plate_number,
            service_type: updated.service_type.service_name,
            due_date: formatDate(updated.due_date),
            contacted_date: formatDate(updated.contacted_date!),
        }
    }

    static async postponeReminder(reminder_id: number, data: PostponeReminder) {
        const reminder = await reminderRepository.findById(reminder_id);
        if (!reminder) {
            throw new NotFoundException("Reminder not found");
        }

        const updated = await reminderRepository.postponeDueDate(reminder_id, data.due_date);

        return {
            id: updated.reminder_id,
            client_name: updated.vehicle.client.name,
            mobile_number: updated.vehicle.client.mobile_number,
            plate_number: updated.vehicle.plate_number,
            service_type: updated.service_type.service_name,
            due_date: formatDate(updated.due_date),
            contacted_date: updated.contacted_date ? formatDate(updated.contacted_date) : null,
        };
    }

    static async getWhatsappLink(reminder_id: number) {
        const reminder = await reminderRepository.findByIdWithDetails(reminder_id);
        if (!reminder) {
            throw new NotFoundException("Reminder not found");
        }

        const message = `Hi ${reminder.vehicle.client.name}, your vehicle (${reminder.vehicle.plate_number} ${reminder.vehicle.make} ${reminder.vehicle.model} ${reminder.vehicle.year}) with service type ${reminder.service_type.service_name}ue for ${reminder.service_type.service_name} on ${formatDate(reminder.due_date)}. Please contact us to schedule your visit.`;

        const link = `https://wa.me/${reminder.vehicle.client.mobile_number}?text=${encodeURIComponent(message)}`;//encodeURIComponent to encode the message to be sent in the whatsapp link

        return { link };
    }

}