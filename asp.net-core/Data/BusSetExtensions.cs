using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.EntityFrameworkCore;

namespace BMU.Controllers
{
    public static class BusSetExtensions
    {
        public static async Task<List<Bus>> GetAllAsync(this DbSet<Bus> set, Guid routeId)
        {
            // Get all data in route from database
            return await set
                .Where(bus => bus.CurrentRouteId == routeId && !bus.Deleted.HasValue)
                .OrderBy(bus => bus.NumberPlate)
                .ToListAsync();
        }

        public static async Task<Bus?> GetAsync(this DbSet<Bus> set, string numberPlate)
        {
            // Get data from database using number plate
            return await set
                .FirstOrDefaultAsync(bus => bus.NumberPlate == numberPlate && !bus.Deleted.HasValue);
        }
    }
}
