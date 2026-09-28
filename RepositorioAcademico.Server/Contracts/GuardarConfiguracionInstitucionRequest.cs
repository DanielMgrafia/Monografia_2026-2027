using System.ComponentModel.DataAnnotations;

namespace RepositorioAcademico.Server.Contracts
{
    public class GuardarConfiguracionInstitucionRequest
    {
        [StringLength(200, ErrorMessage = "El nombre de la institucion no puede exceder 200 caracteres.")]
        public string? NombreInstitucion { get; set; }

        [StringLength(200000, ErrorMessage = "El logo de la institucion es demasiado grande.")]
        public string? LogoUrl { get; set; }

        [StringLength(50, ErrorMessage = "El telefono no puede exceder 50 caracteres.")]
        public string? Telefono { get; set; }

        [StringLength(150, ErrorMessage = "El email no puede exceder 150 caracteres.")]
        [EmailAddress(ErrorMessage = "El email no es valido.")]
        public string? Email { get; set; }

        [StringLength(2000, ErrorMessage = "La mision no puede exceder 2000 caracteres.")]
        public string? Mision { get; set; }

        [StringLength(2000, ErrorMessage = "La vision no puede exceder 2000 caracteres.")]
        public string? Vision { get; set; }
    }
}
