using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.AspNetCore.Mvc;
using static System.Collections.Specialized.BitVector32;

namespace BMU.Controllers
{
    [ApiController]
    [Route("Routes")]
    [Produces("application/json")]
    public class RouteController : ControllerBase
    {
        private readonly DataContext _context;

        public RouteController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(CreateOrUpdateRouteDto data)
        {
            // Check if request user is admin
            if (!string.IsNullOrWhiteSpace(data.Name) && data.StationIds != null && data.StationIds.Count > 0)
            {
                // Check if request user is admin
                if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                {
                    // Check if route name is registered
                    if (await _context.Route.GetAsync(data.Name) == null)
                    {
                        var stations = new List<Station>();
                        foreach (var stationId in data.StationIds)
                        {
                            // Get station from database
                            var station = await _context.Station.GetAsync(stationId);
                            if (station != null)
                            {
                                stations.Add(station);
                            }
                            else
                            {
                                // Return error message
                                return NotFound("Station is not found");
                            }
                        }
                        // Create a new route entity
                        var route = new Route
                        {
                            Name = data.Name,
                            Stations = stations
                        };
                        // Save new route to database
                        await _context.Route.CreateAsync(_context, route, stations);
                        // Return message
                        return Ok(route);
                    }

                    // Return error
                    return Conflict("Name is registered");
                }
                // Return error message
                return Unauthorized("Only admin can create a route");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] bool? namesOnly)
        {
            // Get routes from database
            var routes = await _context.Route.GetAllAsync();
            // Order routes by name
            routes = routes.OrderBy(route => route.Name).ToList();
            if (namesOnly.HasValue && namesOnly.Value)
            {
                // Return routes
                return Ok(routes.Select(route => new NameOnlyRouteDto
                {
                    Id = route.Id,
                    Name = route.Name
                }));
            }
            // Return routes
            return Ok(routes.Select(route => {
                route.HasBuses = _context.Bus.FirstOrDefault(bus => bus.CurrentRouteId.HasValue && bus.CurrentRouteId.Value == route.Id && !bus.Deleted.HasValue) != null;
                var stations = _context.RouteStation.GetAllStationsAsync(_context, route.Id);
                stations.Wait();
                route.Stations = stations.Result;
                return route;
            }));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetAsync(Guid id)
        {
            if (id != default)
            {
                // Get route from database
                var route = await _context.Route.GetAsync(id);
                if (route != null)
                {
                    route.Stations = await _context.RouteStation.GetAllStationsAsync(_context, route.Id);
                    // Return route
                    return Ok(route);
                }
                // Return error message
                return NotFound("Route is not found");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateAsync(Guid id, CreateOrUpdateRouteDto data)
        {
            // Check if request user is admin
            if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
            {
                var update = false;
                // Get route
                var route = await _context.Route.GetAsync(id);
                if (route != null)
                {

                    var stations = await _context.RouteStation.GetAllStationsAsync(_context, route.Id);
                    var stationIds = stations.Select(station => station.Id);
                    if (data.StationIds != null && data.StationIds.Count > 0 && !stationIds.SequenceEqual(data.StationIds))
                    {
                        stations = new List<Station>();
                        foreach (var stationId in data.StationIds)
                        {
                            // Get station from database
                            var station = await _context.Station.GetAsync(stationId);
                            if (station != null)
                            {
                                stations.Add(station);
                            }
                            else
                            {
                                // Return error message
                                return NotFound("Station is not found");
                            }
                            update = true;
                        }
                    }
                    if (!string.IsNullOrWhiteSpace(data.Name) && route.Name != data.Name)
                    {
                        // Check if route name is registered
                        if (await _context.Route.GetAsync(data.Name) == null)
                        {
                            route.Name = data.Name;
                            update = true;
                        }
                        else
                        {
                            // Return error message
                            return Conflict("Name is registered");
                        }
                    }
                    if (update)
                    {
                        // Save updated route to database
                        await _context.Route.UpdateAsync(_context, route, stations);
                        // Return message
                        return Ok("Route is updated");
                    }
                    // Return message
                    return Ok("No changes detected");
                }
                // Return error
                return NotFound("Route is not found");
            }
            // Return error message
            return Unauthorized("Only admin can update route");
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            if (id != default)
            {
                // Check if request user is admin
                if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                {
                    // Get route
                    var route = await _context.Route.GetAsync(id);
                    if (route != null)
                    {
                        // Delete route from database
                        await _context.Route.DeleteAsync(_context, route);
                        // Return message
                        return Ok("Route is deleted");
                    }
                    // Return error message
                    return NotFound("Route is not found");
                }
                // Return error message
                return Unauthorized("Only admin can delete route");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }
    }
}
