using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace BMU.Controllers
{
    [ApiController]
    [Route("Buses")]
    [Produces("application/json")]
    public class BusController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly DataTable _table;
        public BusController(
            DataContext context,
            DataTable table)
        {
            _context = context;
            _table = table;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(CreateOrUpdateBusDto data)
        {
            if (!string.IsNullOrWhiteSpace(data.NumberPlate) && data.Capacity.HasValue && data.Capacity.Value > 0)
            {
                // Check if request user is admin
                if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                {
                    // Check if number plate is registered
                    if (await _context.Bus.GetAsync(data.NumberPlate) == null)
                    {
                        // Create a new bus entity
                        var bus = new Bus
                        {
                            NumberPlate = data.NumberPlate,
                            Capacity = data.Capacity.Value
                        };
                        // Save new bus to database
                        await _context.Bus.CreateAsync(_context, bus);
                        // Return message
                        return Ok(bus);
                    }
                    // Return error message
                    return Conflict("Number plate is registered");
                }
                // Return error message
                return Unauthorized("Only admin can create a bus");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] bool? numberPlatesOnly, [FromQuery] bool? detailed, [FromQuery] Guid? currentRouteId)
        {
            List<Bus> buses;
            if (currentRouteId.HasValue && currentRouteId.Value != default)
            {
                // Get buses in current route from database
                buses = await _context.Bus.GetAllAsync(currentRouteId.Value);
            }
            else
            {
                // Get buses from database
                buses = await _context.Bus.GetAllAsync();
            }
            // Order bus by number plate
            buses = buses.OrderBy(bus => bus.NumberPlate).ToList();
            if (numberPlatesOnly.HasValue && numberPlatesOnly.Value)
            {
                // Return bus number plates only
                return Ok(buses.Select(bus => new NumberPlateOnlyBusDto
                {
                    Id = bus.Id,
                    NumberPlate = bus.NumberPlate
                }));
            }
            if (detailed.HasValue && detailed.Value)
            {
                // Return buses with station names and disinfection times
                var complexBuses = new List<ComplexBusDto>();
                foreach (var bus in buses)
                {
                    complexBuses.Add(await GetBusWithStationAndDisinfectionAsync(bus));
                }
                return Ok(complexBuses);
            }
            // Return buses
            return Ok(buses);
        }

        [HttpGet("{numberPlate}")]
        public async Task<IActionResult> GetAsync(string numberPlate)
        {
            if (!string.IsNullOrWhiteSpace(numberPlate))
            {
                // Get bus from database
                var bus = await _context.Bus.GetAsync(numberPlate);
                if (bus != null)
                {
                    // Return bus with station name and disinfection time without ID
                    return Ok(await GetBusWithStationAndDisinfectionAsync(bus));
                }
                // Return error message
                return NotFound("Bus is not found");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateAsync(Guid id, CreateOrUpdateBusDto data)
        {
            if (id != default)
            {
                // Check if request user is admin
                if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                {
                    // Get bus from database
                    var bus = await _context.Bus.GetAsync(id);
                    if (bus != null)
                    {
                        var update = false;
                        if (data.Capacity.HasValue && bus.Capacity != data.Capacity.Value)
                        {
                            if (data.Capacity.Value > 0)
                            {
                                bus.Capacity = data.Capacity.Value;
                                update = true;
                            }
                            else
                            {
                                // Return error message
                                return BadRequest("Data is invalid");
                            }
                        }
                        if (!string.IsNullOrWhiteSpace(data.NumberPlate) && bus.NumberPlate != data.NumberPlate)
                        {
                            // Check if number plate is registered
                            if (await _context.Bus.GetAsync(data.NumberPlate) == null)
                            {
                                bus.NumberPlate = data.NumberPlate;
                                update = true;
                            }
                            else
                            {
                                // Return error message
                                return Conflict("Number plate is registered");
                            }
                        }
                        if (update)
                        {
                            // Save updated bus to database
                            await _context.Bus.UpdateAsync(_context, bus);
                            // Return message
                            return Ok("Bus is updated");
                        }                        
                        // Return message
                        return Ok("No changes detected");
                    }
                    // Return error message
                    return NotFound("Bus is not found");
                }
                // Return error message
                return Unauthorized("Only admin can update bus");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpPut("{numberPlate}")]
        public async Task<IActionResult> UpdateAsync(string numberPlate, UpdateDriverBusDto data)
        {
            // Check if request user is driver
            if (await Utils.IsDriverFromHeaderAsync(Request.Headers, _context))
            {
                // Get bus from database
                var bus = await _context.Bus.GetAsync(numberPlate);
                if (bus != null)
                {
                    if (data.CurrentUsage.HasValue && data.CurrentUsage.Value >= 0)
                    {
                        bus.CurrentUsage = data.CurrentUsage.Value;
                        // Save updated current usage to database
                        await _context.Bus.UpdateAsync(_context, bus);
                        // Return message
                        return Ok("Current usage is updated");
                    }
                    if (data.CurrentRouteId.HasValue)
                    {
                        // Get route from database
                        var route = await _context.Route.GetAsync(data.CurrentRouteId.Value);
                        if (route != null)
                        {
                            var firstRouteStation = await _context.RouteStation.FirstOrDefaultAsync(routeStation => routeStation.RouteId == route.Id && routeStation.Order == 0);
                            bus.CurrentRouteId = route.Id;
                            // Save updated route to database
                            await _context.Bus.UpdateAsync(_context, bus);
                            // Create a new location entity
                            var location = new Location(bus.Id)
                            {
                                StationId = firstRouteStation.StationId
                            };
                            // Add new location to table storage
                            await _table.Location.CreateAsync(location);
                            // Return message
                            return Ok("Current route is updated");
                        }
                        // Return error message
                        return NotFound("Route is not found");
                    }
                    if (data.StopRoute)
                    {
                        bus.CurrentUsage = 0;
                        bus.CurrentRouteId = null;
                        // Save updated route to database
                        await _context.Bus.UpdateAsync(_context, bus);
                        // Return message
                        return Ok("Current route is stopped");
                    }
                    if (data.StationId.HasValue)
                    {
                        if (bus.CurrentRouteId != null)
                        {
                            // Get next station
                            var station = await _context.Station.GetAsync(data.StationId.Value);
                            if (station != null)
                            {
                                // Add new location to table storage
                                await _table.Location.CreateAsync(new Location(bus.Id)
                                {
                                    StationId = station.Id
                                });
                                // Return message
                                return Ok("Updated location");
                            }
                            // Return error message
                            return NotFound("Station is not in route");
                        }
                        // Return error message
                        return BadRequest("Bus has not selected route");
                    }
                    if (data.Disinfected)
                    {
                        // Add new disinfection to table storage
                        await _table.Disinfection.CreateAsync(new Disinfection(bus.Id));
                        // Return message
                        return Ok("Updated disinfection time");
                    }
                }
                // Return error message
                return NotFound("Bus is not found");
            }
            // Return error message
            return Unauthorized("Only driver can update bus");
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            if (id != default)
            {
                // Check if request user is admin
                if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                {
                    // Get bus from database
                    var bus = await _context.Bus.GetAsync(id);
                    if (bus != null)
                    {
                        // Delete bus from database
                        await _context.Bus.DeleteAsync(_context, bus);
                        // Return message
                        return Ok("Bus is deleted");
                    }
                    // Return error message
                    return NotFound("Bus is not found");
                }
                // Return error message
                return Unauthorized("Only admin can delete bus");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        private async Task<ComplexBusDto> GetBusWithStationAndDisinfectionAsync(Bus bus)
        {
            // Create a new bus entity with station name and disinfection time
            var complexBus = new ComplexBusDto
            {
                Id = bus.Id,
                NumberPlate = bus.NumberPlate,
                Capacity = bus.Capacity,
                CurrentUsage = bus.CurrentUsage,
                CurrentRouteId = bus.CurrentRouteId,
            };
            // Get location from table storage
            var location = _table.Location.GetLatest<Location>(bus.Id.ToString());
            if (location != null)
            {
                // Get station from database
                var station = await _context.Station.GetAsync(location.StationId);
                if (station != null)
                {
                    complexBus.StationName = station.Name;
                    if (location.Timestamp.HasValue)
                    {
                        complexBus.Timestamp = location.Timestamp.Value;
                    }
                }
            }
            // Get disinfection from table storage
            var disinfection = _table.Disinfection.GetLatest<Disinfection>(bus.Id.ToString());
            if (disinfection != null && disinfection.Timestamp.HasValue)
            {
                complexBus.DisinfectionTime = disinfection.Timestamp.Value;
                if (complexBus.DisinfectionTime > complexBus.Timestamp)
                {
                    complexBus.Timestamp = complexBus.DisinfectionTime;
                }
            }
            // Return bus with station name and disinfection time
            return complexBus;
        }
    }
}
