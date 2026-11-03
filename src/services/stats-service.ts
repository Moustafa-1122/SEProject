import { statsRepository } from "@/repository/stats-repository";
import { getMonthRanges, getStartOfTodayUTC } from "@/lib/date-ranges";

// function to calculate the percentage change between two numbers
function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function compare(current: number, previous: number) {
  return {
    this_month: current,
    last_month: previous,
    change_percent: percentChange(current, previous),
  };
}

/**
 * A service class that provides methods for retrieving statistics data
 */
export class StatsService {
  /**
   * Asynchronously retrieves dashboard statistics including active clients, new clients, service records,
   * visited clients, and overdue reminders for the current and previous months
   * @returns An object containing various statistics data
   */
  static async getDashboardStats() {
    // Get date ranges for the last, current, and next month
    const { startOfLastMonth, startOfThisMonth, startOfNextMonth } =
      getMonthRanges();

    // Execute multiple database queries in parallel to fetch statistics
    const [
      activeClients,                    // Total number of active clients
      newClientsThisMonth,             // Number of new clients in current month
      newClientsLastMonth,             // Number of new clients in last month
      recordsThisMonth,                // Number of service records in current month
      recordsLastMonth,                // Number of service records in last month
      visitedThisMonth,                // Number of visited clients in current month
      visitedLastMonth,                // Number of visited clients in last month
      overdueCount,                    // Number of overdue reminders
    ] = await Promise.all([
      statsRepository.countActiveClients(),
      statsRepository.countNewClients(startOfThisMonth, startOfNextMonth),
      statsRepository.countNewClients(startOfLastMonth, startOfThisMonth),
      statsRepository.countServiceRecords(startOfThisMonth, startOfNextMonth),
      statsRepository.countServiceRecords(startOfLastMonth, startOfThisMonth),
      statsRepository.countVisitedClients(startOfThisMonth, startOfNextMonth),
      statsRepository.countVisitedClients(startOfLastMonth, startOfThisMonth),
      statsRepository.countOverdueReminders(getStartOfTodayUTC()),
    ]);

    return {
      active_clients: {
        total: activeClients,
        new_this_month: newClientsThisMonth,
      },
      service_records: compare(recordsThisMonth, recordsLastMonth),
      clients_visited: compare(visitedThisMonth, visitedLastMonth),
      new_clients: compare(newClientsThisMonth, newClientsLastMonth),
      overdue: { total: overdueCount },
    };
  }
}