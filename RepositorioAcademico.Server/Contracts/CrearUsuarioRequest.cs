using System.ComponentModel.DataAnnotations;

namespace RepositorioAcademico.Server.Contracts
{
    public class CrearUsuarioRequest
    {
        [Required(ErrorMessage = "Los nombres son obligatorios.")]
        [StringLength(150, ErrorMessage = "Los nombres no pueden exceder 150 caracteres.")]
        public string Nombres { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los apellidos son obligatorios.")]
        [StringLength(150, ErrorMessage = "Los apellidos no pueden exceder 150 caracteres.")]
        public string Apellidos { get; set; } = string.Empty;

        [Required(ErrorMessage = "El correo es obligatorio.")]
        [EmailAddress(ErrorMessage = "El correo no es valido.")]
        [StringLength(150, ErrorMessage = "El correo no puede exceder 150 caracteres.")]
        public string Correo { get; set; } = string.Empty;

        [Required(ErrorMessage = "El carnet es obligatorio.")]
        [StringLength(50, ErrorMessage = "El carnet no puede exceder 50 caracteres.")]
        public string Carnet { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contrasena es obligatoria.")]
        [MinLength(8, ErrorMessage = "La contrasena debe tener al menos 8 caracteres.")]
        public string Password { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "El estado no puede exceder 50 caracteres.")]
        public string? Estado { get; set; }

        public List<int> RolIds { get; set; } = [];
    }
}
