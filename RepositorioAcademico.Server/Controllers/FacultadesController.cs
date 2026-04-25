using Microsoft.AspNetCore.Mvc;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FacultadesController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public FacultadesController(RepositorioDbContext context)
        {
            _context = context;
        }
    }
}
