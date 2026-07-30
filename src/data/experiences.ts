export interface Experience {
    id: string;
    title: string;
    organization: string;
    period: string;
    bullets: string[];
}

export const experiences: Experience[] = [
    {
        id: "bb-interno",
        title: "Backend Engineer Intern — plataformas internas e IA",
        organization: "Banco do Brasil",
        period: "06/2025 - atual",
        bullets: [
            "Lidero o desenvolvimento de um framework interno em Python para integrações e acesso a dados em PostgreSQL, IBM DB2 e SQLite.",
            "Reestruturei o pooling de conexões e padronizei a criação de aplicações com Application Factory, Jinja, HTMX e uma CLI interna.",
            "Desenvolvi uma plataforma multiagente para análise de indicadores estratégicos, integrando LLMs, dados corporativos e visualizações vetoriais.",
            "Reduzi em 50% o tempo de scaffolding de novas interfaces com componentes e templates reutilizáveis.",
        ],
    },
    {
        id: "ibict-nlp",
        title: "Pesquisa — microsserviço de classificação textual com NLP",
        organization: "IBICT",
        period: "03/2025 - 11/2025",
        bullets: [
            "Construí um microsserviço FastAPI assíncrono para classificação de texto, separando a API HTTP da inferência em segundo plano.",
            "Implementei filas confiáveis em Redis, com retry, recuperação após falhas e encerramento seguro dos workers.",
            "Executei inferência em lote com BERTimbau em GPU e validei carga e robustez com testes automatizados em k6.",
        ],
    },
    {
        id: "elattes-pipeline",
        title: "Engenharia de dados — pipeline distribuído para currículos Lattes",
        organization: "eLattes / FAPDF",
        period: "09/2025 - atual",
        bullets: [
            "Projetei um pipeline orientado a eventos em cinco estágios, coordenado por Kafka e persistido em PostgreSQL.",
            "Extraí e normalizei dados de currículos Lattes em XML para datasets Parquet de pesquisadores, publicações, orientações e patentes.",
            "Desenvolvi jobs PySpark para deduplicar publicações e inferir conexões entre pesquisadores a partir de coautorias.",
            "Implementei recuperação de estado, retries, DLQ e artefatos versionados para rastreabilidade do processamento.",
        ],
    },
];
