using System.ComponentModel.DataAnnotations;

namespace RepositorioAcademico.Server.Contracts
{
    public class ActualizarEstadoDocumentoRequest
    {
        [Required(ErrorMessage = "El estado es obligatorio.")]
        [StringLength(50, ErrorMessage = "El estado no puede exceder 50 caracteres.")]
        public string Estado { get; set; } = string.Empty;
    }
}
