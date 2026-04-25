using System.ComponentModel.DataAnnotations;

namespace RepositorioAcademico.Server.Contracts
{
    public class CrearRolRequest
    {
        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres.")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "La descripcion no puede exceder 200 caracteres.")]
        public string? Descripcion { get; set; }

        [StringLength(50, ErrorMessage = "El estado no puede exceder 50 caracteres.")]
        public string? Estado { get; set; }

        public List<int> PermisoIds { get; set; } = [];
    }
}
