using Microsoft.AspNetCore.Mvc;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentosController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public DocumentosController(RepositorioDbContext context)
        {
            _context = context;
        }

        // GET: api/documentos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Documento>>> GetDocumentos()
        {
            return await _context.Documentos.ToListAsync();
        }

        // GET: api/documentos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Documento>> GetDocumento(int id)
        {
            var documento = await _context.Documentos.FindAsync(id);

            if (documento == null)
            {
                return NotFound();
            }

            return documento;
        }

        // POST: api/documentos
        [HttpPost]
        public async Task<ActionResult<Documento>> CrearDocumento(Documento documento)
        {
            documento.FechaSubida = DateTime.Now;
            documento.Estado = "Pendiente";

            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDocumento), new { id = documento.Id }, documento);
        }

    }
}
