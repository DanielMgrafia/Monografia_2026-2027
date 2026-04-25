using System.ComponentModel.DataAnnotations;

namespace RepositorioAcademico.Server.Contracts
{
    public class CrearPermisoRequest
    {
        [Required(ErrorMessage = "El codigo es obligatorio.")]
        [StringLength(100, ErrorMessage = "El codigo no puede exceder 100 caracteres.")]
        public string Codigo { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripcion es obligatoria.")]
        [StringLength(200, ErrorMessage = "La descripcion no puede exceder 200 caracteres.")]
        public string Descripcion { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "El estado no puede exceder 50 caracteres.")]
        public string? Estado { get; set; }
    }
}
