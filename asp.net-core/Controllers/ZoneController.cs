using System;
using System.Linq;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.AspNetCore.Mvc;

namespace BMU.Controllers
{
    [ApiController]
    [Route("Zones")]
    [Produces("application/json")]
    public class ZoneController : ControllerBase
    {
        private readonly DataContext _context;

        public ZoneController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(CreateOrUpdateZoneDto data)
        {
            if (!string.IsNullOrWhiteSpace(data.Name) && data.LocationValue.HasValue && data.LocationValue.Value >= 0)
            {
                // Check if request user is admin
                if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                {
                    // Check if zone name is registered
                    if (await _context.Zone.GetAsync(data.Name) == null)
                    {
                        // Create a new zone entity
                        var zone = new Zone
                        {
                            Name = data.Name,
                            LocationValue = data.LocationValue.Value
                        };
                        // Save new zone to database
                        await _context.Zone.CreateAsync<Zone>(_context, zone);
                        // Return message
                        return Ok(zone);
                    }
                    // Return error message
                    return Conflict("Zone name is registered");
                }
                // Return error message
                return Unauthorized("Only admin can create a zone");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            // Get zones from database
            var zones = await _context.Zone.GetAllAsync();
            // Return zones
            return Ok(zones.OrderBy(zone => zone.Name).Select(zone =>
            {
                zone.HasStations = _context.Station.FirstOrDefault(station => station.ZoneId == zone.Id && !station.Deleted.HasValue) != null;
                return zone;
            }));
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateAsync(Guid id, CreateOrUpdateZoneDto data)
        {
            if (id != default)
            {
                // Check if request user is admin
                if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
                {
                    var update = false;
                    // Get zone from database
                    var zone = await _context.Zone.GetAsync(id);
                    if (zone != null)
                    {
                        if (!string.IsNullOrWhiteSpace(data.Name) && zone.Name != data.Name)
                        {
                            // Check if zone name is registered
                            if (await _context.Zone.GetAsync(data.Name) == null)
                            {
                                zone.Name = data.Name;
                                update = true;
                            }
                            else
                            {
                                // Return error message
                                return Conflict("Zone name is registered");
                            }
                        }
                        if (data.LocationValue.HasValue && zone.LocationValue != data.LocationValue.Value)
                        {
                            if (data.LocationValue.Value >= 0)
                            {
                                zone.LocationValue = data.LocationValue.Value;
                                update = true;
                            }
                            else
                            {
                                // Return error message
                                return BadRequest("Data is invalid");
                            }
                        }
                        if (update)
                        {
                            // Save updated zone to database
                            await _context.Zone.UpdateAsync(_context, zone);
                            // Return message
                            return Ok("Zone is updated");
                        }
                        // Return message
                        return Ok("No changes detected");
                    }
                    // Return error message
                    return NotFound("Zone is not found");
                }
                // Return error message
                return Unauthorized("Only admin can update zone");
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
                    // Get zone from database
                    var zone = await _context.Zone.GetAsync(id);
                    if (zone != null)
                    {
                        // Delete zone from database
                        await _context.Zone.DeleteAsync(_context, zone);
                        // Return message
                        return Ok("Zone is deleted");
                    }
                    // Return error message
                    return NotFound("Zone is not found");
                }
                // Return error message
                return Unauthorized("Only admin can delete zone");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }
    }
}
