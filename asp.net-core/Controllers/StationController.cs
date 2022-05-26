using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BMU.Controllers
{
    [ApiController]
    [Route("Stations")]
    [Produces("application/json")]
    public class StationController : ControllerBase
    {
        private readonly DataContext _context;

        public StationController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(CreateOrUpdateStationDto data)
        {
            if (!string.IsNullOrWhiteSpace(data.Name) && data.ZoneId.HasValue)
            {
                // Get zone from database
                var zone = await _context.Zone.GetAsync(data.ZoneId.Value);
                if (zone != null)
                {
                    // Check if request user is admin
                    if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                    {
                        // Check if station name is registered
                        if (await _context.Station.GetAsync(data.Name) == null)
                        {
                            // Create a new station entity
                            var station = new Station
                            {
                                Name = data.Name,
                                ZoneId = zone.Id
                            };
                            // Save new station to database
                            await _context.Station.CreateAsync(_context, station);
                            // Return message
                            return Ok(station);
                        }
                        // Return error message
                        return Conflict("Station name is registered");
                    }
                    // Return error message
                    return Unauthorized("Only admin can create a station");
                }
                // Return error message
                return NotFound("Zone is not found");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] bool? namesOnly, [FromQuery] bool? includeDeleted)
        {
            // Get stations from database
            List<Station> stations;
            if (includeDeleted.HasValue && includeDeleted.Value)
            {
                stations = await _context.Station.ToListAsync();
            }
            else
            {
                stations = await _context.Station.GetAllAsync();
            }
            // Order stations by name
            stations = stations.OrderBy(station => station.Name).ToList();
            if (namesOnly.HasValue && namesOnly.Value)
            {
                // Return stations
                return Ok(stations.Select(station => new NameOnlyStationDto
                {
                    Id = station.Id,
                    Name = station.Name
                }));
            }
            // Return stations
            return Ok(stations.Select(station =>
            {
                station.HasRoutes = _context.RouteStation.FirstOrDefault(routeStation => routeStation.StationId == station.Id) != null;
                return station;
            }));
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateAsync(Guid id, CreateOrUpdateStationDto data)
        {
            if (id != default)
            {
                // Check if request user is admin
                if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                {
                    var update = false;
                    // Get station from database
                    var station = await _context.Station.GetAsync(id);
                    if (station != null)
                    {
                        if (!string.IsNullOrWhiteSpace(data.Name) && station.Name != data.Name)
                        {
                            // Check if station name is registered
                            if (await _context.Station.GetAsync(data.Name) == null)
                            {
                                station.Name = data.Name;
                                update = true;
                            }
                            else
                            {
                                // Return error message
                                return Conflict("Station name is registered");
                            }
                        }
                        if (data.ZoneId.HasValue && station.ZoneId != data.ZoneId)
                        {
                            // Get zone from database
                            var zone = await _context.Zone.GetAsync(data.ZoneId.Value);
                            if (zone != null)
                            {
                                station.ZoneId = zone.Id;
                                update = true;
                            }
                            else
                            {
                                // Return error message
                                return NotFound("Zone is not found");
                            }
                        }
                        if (update)
                        {
                            // Save updated station to database
                            await _context.Station.UpdateAsync(_context, station);
                            // Return message
                            return Ok("Station is updated");
                        }
                        // Return message
                        return Ok("No changes detected");
                    }
                    // Return error message
                    return NotFound("Station is not found");
                }
                // Return error message
                return Unauthorized("Only admin can update station");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            if (id != default)
            {
                // Check if request user is admin
                if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                {
                    // Get station from database
                    var station = await _context.Station.GetAsync(id);
                    if (station != null)
                    {
                        // Delete station from database
                        await _context.Station.DeleteAsync(_context, station);
                        // Return message
                        return Ok("Station is deleted");
                    }
                    // Return error message
                    return NotFound("Station is not found");
                }
                // Return error message
                return Unauthorized("Only admin can delete station");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }
    }
}
