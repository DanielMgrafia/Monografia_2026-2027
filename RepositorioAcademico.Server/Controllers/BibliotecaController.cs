using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/biblioteca")]
    public class BibliotecaController : ControllerBase
    {
        private sealed record ActividadItem(int DocumentoId, DateTime FechaActividad);

        private const string PermisoVerRepositorio = "REPOSITORIO.VER";
        private const string PermisoSubirDocumento = "DOCUMENTO.SUBIR";
        private const string PermisoPublicarDocumento = "DOCUMENTO.PUBLICAR";

        private readonly RepositorioDbContext _context;

        public BibliotecaController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpPost("documentos/{id:int}/vista")]
        public async Task<IActionResult> RegistrarVista(int id)
        {
            if (!PuedeConsultarDocumentos())
            {
                return Forbid();
            }

            var usuarioActualId = ObtenerUsuarioActualId();
            if (!usuarioActualId.HasValue)
            {
                return Unauthorized();
            }

            var documentoExiste = await ConstruirConsultaDocumentosVisiblesEntidad()
                .AnyAsync(documento => documento.Id == id);

            if (!documentoExiste)
            {
                return NotFound();
            }

            _context.DocumentoVistas.Add(new DocumentoVista
            {
                DocumentoId = id,
                UsuarioId = usuarioActualId.Value,
                FechaVista = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("documentos/{id:int}/favorito")]
        public async Task<ActionResult<FavoritoDocumentoDto>> AlternarFavorito(int id)
        {
            if (!PuedeConsultarDocumentos())
            {
                return Forbid();
            }

            var usuarioActualId = ObtenerUsuarioActualId();
            if (!usuarioActualId.HasValue)
            {
                return Unauthorized();
            }

            var documentoExiste = await ConstruirConsultaDocumentosVisiblesEntidad()
                .AnyAsync(documento => documento.Id == id);

            if (!documentoExiste)
            {
                return NotFound();
            }

            var favorito = await _context.DocumentoFavoritos
                .FirstOrDefaultAsync(item => item.DocumentoId == id && item.UsuarioId == usuarioActualId.Value);

            if (favorito != null)
            {
                _context.DocumentoFavoritos.Remove(favorito);
                await _context.SaveChangesAsync();

                return Ok(new FavoritoDocumentoDto
                {
                    DocumentoId = id,
                    EsFavorito = false
                });
            }

            favorito = new DocumentoFavorito
            {
                DocumentoId = id,
                UsuarioId = usuarioActualId.Value,
                FechaMarcado = DateTime.UtcNow
            };

            _context.DocumentoFavoritos.Add(favorito);
            await _context.SaveChangesAsync();

            return Ok(new FavoritoDocumentoDto
            {
                DocumentoId = id,
                EsFavorito = true,
                FechaMarcado = favorito.FechaMarcado
            });
        }

        [HttpGet("historial")]
        public async Task<ActionResult<HistorialBibliotecaDto>> GetHistorial()
        {
            if (!PuedeConsultarDocumentos())
            {
                return Forbid();
            }

            var usuarioActualId = ObtenerUsuarioActualId();
            if (!usuarioActualId.HasValue)
            {
                return Unauthorized();
            }

            var vistas = await _context.DocumentoVistas
                .AsNoTracking()
                .Where(item => item.UsuarioId == usuarioActualId.Value)
                .OrderByDescending(item => item.FechaVista)
                .Select(item => new ActividadItem(item.DocumentoId, item.FechaVista))
                .Take(20)
                .ToListAsync();

            var descargas = await _context.DocumentoDescargas
                .AsNoTracking()
                .Where(item => item.UsuarioId == usuarioActualId.Value)
                .OrderByDescending(item => item.FechaDescarga)
                .Select(item => new ActividadItem(item.DocumentoId, item.FechaDescarga))
                .Take(20)
                .ToListAsync();

            var favoritos = await _context.DocumentoFavoritos
                .AsNoTracking()
                .Where(item => item.UsuarioId == usuarioActualId.Value)
                .OrderByDescending(item => item.FechaMarcado)
                .Select(item => new ActividadItem(item.DocumentoId, item.FechaMarcado))
                .Take(20)
                .ToListAsync();

            var documentoIds = vistas.Select(item => item.DocumentoId)
                .Concat(descargas.Select(item => item.DocumentoId))
                .Concat(favoritos.Select(item => item.DocumentoId))
                .Distinct()
                .ToArray();

            var documentosPorId = await ConstruirConsultaDocumentos(usuarioActualId.Value)
                .Where(documento => documentoIds.Contains(documento.Id))
                .ToDictionaryAsync(documento => documento.Id);

            return Ok(new HistorialBibliotecaDto
            {
                Vistos = ConstruirActividad(vistas, documentosPorId),
                Descargas = ConstruirActividad(descargas, documentosPorId),
                Favoritos = ConstruirActividad(favoritos, documentosPorId)
            });
        }

        [HttpGet("recomendaciones")]
        public async Task<ActionResult<IEnumerable<DocumentoDto>>> GetRecomendaciones()
        {
            if (!PuedeConsultarDocumentos())
            {
                return Forbid();
            }

            var usuarioActualId = ObtenerUsuarioActualId();
            if (!usuarioActualId.HasValue)
            {
                return Unauthorized();
            }

            var historialDocumentos = await _context.DocumentoVistas
                .AsNoTracking()
                .Where(item => item.UsuarioId == usuarioActualId.Value)
                .Select(item => item.Documento)
                .Concat(_context.DocumentoDescargas
                    .AsNoTracking()
                    .Where(item => item.UsuarioId == usuarioActualId.Value)
                    .Select(item => item.Documento))
                .Concat(_context.DocumentoFavoritos
                    .AsNoTracking()
                    .Where(item => item.UsuarioId == usuarioActualId.Value)
                    .Select(item => item.Documento))
                .Where(documento => documento != null)
                .ToListAsync();

            var historialIds = historialDocumentos
                .Where(documento => documento != null)
                .Select(documento => documento!.Id)
                .ToHashSet();

            var facultadesPreferidas = historialDocumentos
                .Where(documento => documento != null)
                .Select(documento => documento!.FacultadId)
                .ToHashSet();

            var palabrasPreferidas = historialDocumentos
                .SelectMany(documento => SepararPalabras(documento?.PalabrasClave))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var candidatos = await ConstruirConsultaDocumentos(usuarioActualId.Value)
                .Where(documento => documento.Estado == "Publicado" && !historialIds.Contains(documento.Id))
                .ToListAsync();

            if (candidatos.Count == 0)
            {
                return Ok(Array.Empty<DocumentoDto>());
            }

            if (facultadesPreferidas.Count == 0 && palabrasPreferidas.Count == 0)
            {
                return Ok(candidatos
                    .OrderByDescending(documento => documento.FechaSubida)
                    .Take(6)
                    .ToList());
            }

            var recomendaciones = candidatos
                .Select(documento => new
                {
                    Documento = documento,
                    Puntaje =
                        (facultadesPreferidas.Contains(documento.FacultadId) ? 5 : 0) +
                        (SepararPalabras(documento.PalabrasClave)
                            .Count(palabra => palabrasPreferidas.Contains(palabra)) * 2)
                })
                .Where(item => item.Puntaje > 0)
                .OrderByDescending(item => item.Puntaje)
                .ThenByDescending(item => item.Documento.FechaSubida)
                .Select(item => item.Documento)
                .Take(6)
                .ToList();

            if (recomendaciones.Count == 0)
            {
                recomendaciones = candidatos
                    .OrderByDescending(documento => documento.FechaSubida)
                    .Take(6)
                    .ToList();
            }

            return Ok(recomendaciones);
        }

        private IQueryable<Documento> ConstruirConsultaDocumentosVisiblesEntidad()
        {
            var query = _context.Documentos.AsNoTracking();

            if (TienePermiso(PermisoPublicarDocumento))
            {
                return query;
            }

            var usuarioActualId = ObtenerUsuarioActualId();
            if (TienePermiso(PermisoSubirDocumento) && usuarioActualId.HasValue)
            {
                return query.Where(documento =>
                    documento.Estado == "Publicado" ||
                    documento.UsuarioId == usuarioActualId.Value);
            }

            return query.Where(documento => documento.Estado == "Publicado");
        }

        private IQueryable<DocumentoDto> ConstruirConsultaDocumentos(int usuarioActualId)
        {
            return ConstruirConsultaDocumentosVisiblesEntidad()
                .Include(documento => documento.TipoDocumento)
                .Include(documento => documento.Facultad)
                .Include(documento => documento.Usuario)
                .Select(documento => new DocumentoDto
                {
                    Id = documento.Id,
                    Titulo = documento.Titulo,
                    Autor = documento.Autor,
                    TipoDocumentoId = documento.TipoDocumentoId,
                    TipoDocumento = documento.TipoDocumento != null ? documento.TipoDocumento.Descripcion : null,
                    FacultadId = documento.FacultadId,
                    Facultad = documento.Facultad != null ? documento.Facultad.Descripcion : null,
                    RutaDocumento = documento.RutaDocumento,
                    Tutor = documento.Tutor,
                    AnioPublicacion = documento.AnioPublicacion,
                    Descripcion = documento.Descripcion,
                    PalabrasClave = documento.PalabrasClave,
                    FechaSubida = documento.FechaSubida,
                    Estado = documento.Estado,
                    SePuedeDescargar = documento.SePuedeDescargar,
                    UsuarioId = documento.UsuarioId,
                    Usuario = documento.Usuario == null
                        ? null
                        : new UsuarioDocumentoDto
                        {
                            Id = documento.Usuario.Id,
                            Nombres = documento.Usuario.Nombres,
                            Apellidos = documento.Usuario.Apellidos,
                            Correo = documento.Usuario.Correo
                        },
                    EsFavorito = documento.Favoritos.Any(favorito => favorito.UsuarioId == usuarioActualId)
                });
        }

        private static IReadOnlyList<DocumentoActividadDto> ConstruirActividad(
            IEnumerable<ActividadItem> actividades,
            IReadOnlyDictionary<int, DocumentoDto> documentosPorId)
        {
            return actividades
                .Where(item => documentosPorId.ContainsKey(item.DocumentoId))
                .Select(item => new DocumentoActividadDto
                {
                    Documento = documentosPorId[item.DocumentoId],
                    FechaActividad = item.FechaActividad
                })
                .ToList();
        }

        private static IEnumerable<string> SepararPalabras(string? palabrasClave)
        {
            if (string.IsNullOrWhiteSpace(palabrasClave))
            {
                return [];
            }

            return palabrasClave
                .Split([',', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(palabra => !string.IsNullOrWhiteSpace(palabra))
                .Select(palabra => palabra.ToLowerInvariant());
        }

        private bool PuedeConsultarDocumentos()
        {
            return TienePermiso(PermisoVerRepositorio) ||
                   TienePermiso(PermisoSubirDocumento) ||
                   TienePermiso(PermisoPublicarDocumento);
        }

        private bool TienePermiso(string permiso)
        {
            return User.Claims.Any(claim =>
                claim.Type == "permission" &&
                string.Equals(claim.Value, permiso, StringComparison.OrdinalIgnoreCase));
        }

        private int? ObtenerUsuarioActualId()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            return int.TryParse(sub, out var usuarioId) ? usuarioId : null;
        }
    }
}
