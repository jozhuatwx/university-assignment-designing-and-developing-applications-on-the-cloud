using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.EntityFrameworkCore;

namespace BMU.Controllers
{
    public static class RouteSetExtensions
    {
        public static async Task<Route?> GetAsync(this DbSet<Route> set, string name)
        {
            // Get data from database using name
            return await set
                .FirstOrDefaultAsync(route => route.Name == name && !route.Deleted.HasValue);
        }

        public static async Task CreateAsync(this DbSet<Route> set, DataContext context, Route data, List<Station> stations)
        {
            // Add data to database
            await set.AddAsync(data);
            await context.RouteStation.AddRangeAsync(stations.Select((station, index) => new RouteStation
            {
                RouteId = data.Id,
                StationId = station.Id,
                Order = index
            }));
            await context.SaveChangesAsync();
        }

        public static async Task UpdateAsync(this DbSet<Route> set, DataContext context, Route data, List<Station> stations)
        {
            // Update data in database
            set.Update(data);
            context.RouteStation.RemoveRange(await context.RouteStation.GetAllAsync(data.Id));
            await context.RouteStation.AddRangeAsync(stations.Select((station, index) => new RouteStation
            {
                RouteId = data.Id,
                StationId = station.Id,
                Order = index
            }));
            await context.SaveChangesAsync();
        }

        public static async Task DeleteAsync(this DbSet<Route> set, DataContext context, Route data)
        {
            // Soft delete data in database
            data.Deleted = true;
            set.Update(data);
            context.RouteStation.RemoveRange(await context.RouteStation.GetAllAsync(data.Id));
            await context.SaveChangesAsync();
        }
    }
}
