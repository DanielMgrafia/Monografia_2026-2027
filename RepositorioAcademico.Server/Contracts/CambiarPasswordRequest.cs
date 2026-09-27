using System.ComponentModel.DataAnnotations;

namespace RepositorioAcademico.Server.Contracts
{
    public class CambiarPasswordRequest
    {
        [Required(ErrorMessage = "La contrasena actual es obligatoria.")]
        public string PasswordActual { get; set; } = string.Empty;

        [Required(ErrorMessage = "La nueva contrasena es obligatoria.")]
        [MinLength(8, ErrorMessage = "La nueva contrasena debe tener al menos 8 caracteres.")]
        public string NuevaPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Debes confirmar la nueva contrasena.")]
        public string ConfirmarPassword { get; set; } = string.Empty;
    }
}
