using System.ComponentModel.DataAnnotations;

namespace RepositorioAcademico.Server.Contracts
{
    public class CrearCarreraRequest
    {
        [Required(ErrorMessage = "La descripcion es obligatoria.")]
        [StringLength(150, ErrorMessage = "La descripcion no puede exceder 150 caracteres.")]
        public string Descripcion { get; set; } = string.Empty;

        public int AreaConocimientoId { get; set; }

        [StringLength(50, ErrorMessage = "El estado no puede exceder 50 caracteres.")]
        public string? Estado { get; set; }
    }
}
