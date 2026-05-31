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
        title: "Desenvolvimento de soluções internas, dados e automação",
        organization: "Banco do Brasil",
        period: "06/2025 - atual",
        bullets: [
            "Estruturação de bibliotecas e padrões internos para padronização do acesso a dados e da criação de novos sistemas, com suporte a PostgreSQL e IBM DB2, além de integração com Pandas para análise e manipulação de dados.",
            "Reestruturação do gerenciamento de conexões e do pooling das aplicações da equipe, eliminando travamentos em cenários de alta concorrência e ampliando a estabilidade dos sistemas em operação.",
            "Desenvolvimento de aplicações web internas para consolidação de dados oriundos de APIs e bases corporativas em painéis executivos com atualização dinâmica, permitindo acompanhamento em tempo real e apoio mais ágil à priorização de demandas pela diretoria.",
            "Implementação de plataforma interna de deploy e ciclo de vida de aplicações, com atualização por repositório Git ou upload manual, acompanhamento em tempo real por WebSockets e segregação de logs, reduzindo o tempo de publicação de um dia para poucos minutos.",
            "Modelagem de indicadores estratégicos com abordagem vetorial inspirada em conceitos da física, representando capacidades, direcionadores e aspirações em estruturas matemáticas que permitiram identificar métricas com maior correlação com o futuro negocial do banco.",
            "Estruturação de fluxos com IA e arquitetura multiagente para apoiar a definição, o refinamento e a análise desses indicadores, conectando agentes especialistas a dados corporativos e entregando recursos utilizados por executivos para validar a aderência estratégica.",
            "Criação de componentes reutilizáveis para o frontend e de uma CLI para geração de novos projetos com bibliotecas corporativas pré-configuradas, reduzindo em 50% o tempo de criação de novas interfaces e acelerando a padronização técnica da equipe.",
        ],
    },
    {
        id: "ibict-nlp",
        title: "Desenvolvimento de microsserviço de classificação textual com NLP",
        organization: "IBICT",
        period: "03/2025 - 11/2025",
        bullets: [
            "Desenvolvimento de microsserviço em FastAPI para enfileiramento de mensagens, consulta de resultados por identificador e desacoplamento entre o recebimento de requisições HTTP e o processamento de inferência em segundo plano.",
            "Implementação de filas confiáveis em Redis, com estados de pendência, processamento e repetição de tentativa, incluindo recuperação de itens retidos na inicialização do worker e desligamento seguro ao término do lote em execução.",
            "Estruturação de worker para processamento em lotes e inferência com modelo BERTimbau fine-tuned para detecção de discurso de ódio, com suporte à normalização textual, à execução em GPU e a otimizações de throughput.",
            "Validação da robustez operacional da solução com testes automatizados em K6, contemplando cenários de carga, mensagens ambíguas, payloads inválidos e consultas a resultados inexistentes.",
        ],
    },
    {
        id: "elattes-pipeline",
        title: "Desenvolvimento de pipeline distribuído para análise de currículos Lattes",
        organization: "eLattes",
        period: "09/2025 - atual",
        bullets: [
            "Reestruturação do backend para um pipeline orientado a estágios, no qual a API registra análises no PostgreSQL, o Kafka coordena a execução e workers especializados processam cada etapa em segundo plano.",
            "Implementação da extração de currículos Lattes a partir de arquivos ZIP e XML, com normalização de pesquisadores, publicações, orientações e patentes em datasets Parquet para consumo entre estágios.",
            "Desenvolvimento de jobs em Spark para deduplicação de publicações por DOI, ano e similaridade textual, consolidando registros canônicos e reduzindo ruído em bases com pesquisadores e produções sobrepostas.",
            "Modelagem do cálculo de conexões inferidas entre pesquisadores a partir de publicações compartilhadas e consolidação da saída em artefato JSON versionado, com resumo agregado, erros por etapa e rastreabilidade do processamento.",
        ],
    },
];
