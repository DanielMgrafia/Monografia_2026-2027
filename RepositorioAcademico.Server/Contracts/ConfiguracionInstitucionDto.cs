namespace RepositorioAcademico.Server.Contracts
{
    public class ConfiguracionInstitucionDto
    {
        public int Id { get; set; }

        public string? NombreInstitucion { get; set; }

        public string? LogoUrl { get; set; }

        public string? Telefono { get; set; }

        public string? Email { get; set; }

        public string? Mision { get; set; }

        public string? Vision { get; set; }

        public DateTime? FechaActualizacion { get; set; }
    }
}
