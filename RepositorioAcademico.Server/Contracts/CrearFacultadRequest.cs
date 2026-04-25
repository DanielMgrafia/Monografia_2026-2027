using System.ComponentModel.DataAnnotations;

namespace RepositorioAcademico.Server.Contracts
{
    public class CrearFacultadRequest
    {
        [Required(ErrorMessage = "La descripcion es obligatoria.")]
        [StringLength(150, ErrorMessage = "La descripcion no puede exceder 150 caracteres.")]
        public string Descripcion { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "El estado no puede exceder 50 caracteres.")]
        public string? Estado { get; set; }
    }
}
