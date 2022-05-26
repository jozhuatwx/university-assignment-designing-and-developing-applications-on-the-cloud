using BMU.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BMU.Controllers
{
    public static class RouteStationSetExtensions
    {
        public static async Task<List<RouteStation>> GetAllAsync(this DbSet<RouteStation> set, Guid routeId)
        {
            // Get all data in route from database
            return await set
                .Where(routeStation => routeStation.RouteId == routeId)
                .OrderBy(routeStation => routeStation.Order)
                .ToListAsync();
        }

        public static async Task<List<Station>> GetAllStationsAsync(this DbSet<RouteStation> set, DataContext context, Guid routeId)
        {
            // Get all data in route from database
            var routeStations = await set
                .Where(routeStation => routeStation.RouteId == routeId)
                .OrderBy(routeStation => routeStation.Order)
                .ToListAsync();
            var stations = new List<Station>();
            foreach (var routeStation in routeStations)
            {
                var station = await context.Station.GetAsync(routeStation.StationId);
                if (station != null)
                {
                    stations.Add(station);
                }
            }
            return stations;
        }
    }
}
