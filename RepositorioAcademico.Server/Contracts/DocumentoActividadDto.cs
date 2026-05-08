namespace RepositorioAcademico.Server.Contracts
{
    public class DocumentoActividadDto
    {
        public DocumentoDto Documento { get; set; } = new();

        public DateTime FechaActividad { get; set; }
    }
}
