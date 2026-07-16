# Pacote para parecer jurídico — LGPD / Minha Church

Checklist interno. **Não marcar compliance como definitivo até retorno do advogado.**

## Documentos a enviar

1. Termos de Uso — `/termos` (versão `LEGAL_DOC_VERSION` em `constants/legal.ts`)
2. Política de Privacidade — `/privacidade`
3. Adendo LGPD (DPA) — `/dpa` (versão `DPA_VERSION`)
4. Este checklist + descrição dos fluxos abaixo

## Papéis

| Contexto | Papel |
|----------|--------|
| Dados de membros, pastoral, doações cadastradas pela igreja | Igreja = controladora; Minha Church = operadora |
| Conta/assinatura da plataforma | Minha Church = controladora (em regra) |

Subprocessadores: Stripe, Resend, hospedagem/DB cloud.

## Fluxos implementados no produto

1. **Consentimento parental** (menores com login) — versionado na ficha do membro
2. **Aceite Termos + Privacidade + DPA** no cadastro da igreja — persistido em `legal_acceptances`
3. **DPA** — aceite posterior em Configurações → Geral (owner), se versão desatualizada
4. **Export** — CSV membros; JSON igreja (owner); JSON conta/membro (usuário)
5. **Soft-delete membro** → retenção **90 dias** → job de anonimização
6. **Encerrar igreja** (owner) → `deletedAt` + `purgeAfter` (+90d) → cancelável no período → purge
7. **Excluir conta de usuário** — bloqueado se owner de igreja ativa; soft-delete + purge 90d
8. **DPO publicado** — `legalMeta.dpoName` / `dpaEmail`
9. **Endereço CNPJ** — `legalMeta.address` (preencher com endereço oficial da Receita quando disponível)

## Perguntas explícitas ao advogado

1. Bases legais adequadas para dados de natureza religiosa/pastoral (oração, aconselhamento) no modelo controlador/operador
2. Transferência internacional (Stripe, Resend) — cláusulas/salvaguardas suficientes?
3. Obrigatoriedade formal de DPO para ME neste perfil de tratamento
4. Retenção financeira anonimizada vs exclusão — alinhamento com obrigações fiscais/contábeis
5. Texto do DPA e limitação de responsabilidade nos Termos — ajustes necessários?
6. Backups de provedor de nuvem após exclusão lógica — redação adequada?

## Fora do escopo atual (documentar na política)

- Apagar backups físicos do provedor cloud no ato
- Cookie banner de marketing (apenas cookies essenciais hoje)
- Hard-delete imediato sob ordem ANPD (extensão futura do mesmo serviço de retenção)
