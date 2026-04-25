using System.ComponentModel.DataAnnotations;

namespace RepositorioAcademico.Server.Contracts
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "El correo o carnet es obligatorio.")]
        public string Login { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contrasena es obligatoria.")]
        public string Password { get; set; } = string.Empty;
    }
}
