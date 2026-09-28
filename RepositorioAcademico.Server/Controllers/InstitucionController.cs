using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;
using RepositorioAcademico.Server.Infrastructure.Security;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/institucion")]
    public class InstitucionController : ControllerBase
    {
        private static readonly string[] LogoDataUrlPermitidos =
        [
            "data:image/png;base64,",
            "data:image/jpeg;base64,",
            "data:image/jpg;base64,",
            "data:image/webp;base64,"
        ];

        private readonly RepositorioDbContext _context;

        public InstitucionController(RepositorioDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<ConfiguracionInstitucionDto>> GetConfiguracion()
        {
            var configuracion = await _context.ConfiguracionesInstitucion
                .AsNoTracking()
                .OrderBy(item => item.Id)
                .FirstOrDefaultAsync();

            return configuracion == null
                ? CrearConfiguracionVacia()
                : MapearConfiguracion(configuracion);
        }

        [Authorize(Policy = AuthorizationPolicies.ParametrizarInstitucion)]
        [HttpPut]
        public async Task<ActionResult<ConfiguracionInstitucionDto>> GuardarConfiguracion(
            [FromBody] GuardarConfiguracionInstitucionRequest request)
        {
            string? logoUrl;
            try
            {
                logoUrl = NormalizarLogoUrl(request.LogoUrl);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            var configuracion = await _context.ConfiguracionesInstitucion
                .OrderBy(item => item.Id)
                .FirstOrDefaultAsync();

            if (configuracion == null)
            {
                configuracion = new ConfiguracionInstitucion();
                _context.ConfiguracionesInstitucion.Add(configuracion);
            }

            configuracion.NombreInstitucion = NormalizarTexto(request.NombreInstitucion);
            configuracion.LogoUrl = logoUrl;
            configuracion.Mision = NormalizarTexto(request.Mision);
            configuracion.Vision = NormalizarTexto(request.Vision);
            configuracion.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapearConfiguracion(configuracion);
        }

        private static ConfiguracionInstitucionDto CrearConfiguracionVacia()
        {
            return new ConfiguracionInstitucionDto
            {
                Id = 0,
                NombreInstitucion = null,
                LogoUrl = null,
                Mision = null,
                Vision = null,
                FechaActualizacion = null
            };
        }

        private static ConfiguracionInstitucionDto MapearConfiguracion(ConfiguracionInstitucion configuracion)
        {
            return new ConfiguracionInstitucionDto
            {
                Id = configuracion.Id,
                NombreInstitucion = configuracion.NombreInstitucion,
                LogoUrl = configuracion.LogoUrl,
                Mision = configuracion.Mision,
                Vision = configuracion.Vision,
                FechaActualizacion = configuracion.FechaActualizacion
            };
        }

        private static string? NormalizarTexto(string? valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
        }

        private static string? NormalizarLogoUrl(string? logoUrl)
        {
            if (string.IsNullOrWhiteSpace(logoUrl))
            {
                return null;
            }

            var valor = logoUrl.Trim();
            if (valor.Length > 200000)
            {
                throw new InvalidOperationException("El logo de la institucion es demasiado grande.");
            }

            if (!LogoDataUrlPermitidos.Any(prefix => valor.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException("El logo debe ser una imagen PNG, JPG o WEBP valida.");
            }

            var separador = valor.IndexOf(',');
            if (separador < 0)
            {
                throw new InvalidOperationException("El logo debe ser una imagen PNG, JPG o WEBP valida.");
            }

            try
            {
                Convert.FromBase64String(valor[(separador + 1)..]);
            }
            catch (FormatException)
            {
                throw new InvalidOperationException("El logo debe ser una imagen PNG, JPG o WEBP valida.");
            }

            return valor;
        }
    }
}
