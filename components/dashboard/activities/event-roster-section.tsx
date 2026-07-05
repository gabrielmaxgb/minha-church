"use client";

import { useMemo, useState } from "react";
import { ListChecks, Plus, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import {
	useRemoveEventRoster,
	useUpsertEventRoster,
} from "@/lib/api/queries";
import {
	formatRosterRole,
	normalizeRosterRoleList,
} from "@/lib/ministries/roster";
import { cn } from "@/lib/utils";
import type { ChurchEventDetail } from "@/types/events";

interface EventRosterSectionProps {
	event: ChurchEventDetail;
	canManage: boolean;
}

function availabilityLabel(status: "available" | "unavailable" | null) {
	if (status === "available") {
		return "Disponível";
	}

	if (status === "unavailable") {
		return "Indisponível";
	}

	return "Sem resposta";
}

export function EventRosterSection({
	event,
	canManage,
}: EventRosterSectionProps) {
	const upsertRoster = useUpsertEventRoster(event.id);
	const removeRoster = useRemoveEventRoster(event.id);
	const [memberId, setMemberId] = useState("");
	const [roleLabel, setRoleLabel] = useState("");
	const [error, setError] = useState<string | null>(null);

	const selectedCandidate = useMemo(
		() => event.rosterCandidates.find((item) => item.memberId === memberId),
		[event.rosterCandidates, memberId],
	);

	const roleOptions = useMemo(() => {
		return normalizeRosterRoleList(selectedCandidate?.instruments ?? []).map(
			(item) => formatRosterRole(item),
		);
	}, [selectedCandidate]);

	const memberHasFunctions = roleOptions.length > 0;

	const availableCandidates = event.rosterCandidates.filter(
		(item) => item.availabilityStatus === "available",
	);

	async function handleAdd() {
		const finalRole = roleLabel.trim();

		if (!memberId || !finalRole) {
			setError("Escolha a pessoa e a função cadastrada por ela.");
			return;
		}

		setError(null);

		try {
			await upsertRoster.mutateAsync({ memberId, roleLabel: finalRole });
			setMemberId("");
			setRoleLabel("");
		} catch (addError) {
			setError(
				addError instanceof Error
					? addError.message
					: "Não foi possível adicionar à escala.",
			);
		}
	}

	async function handleRemove(assignmentMemberId: string) {
		setError(null);

		try {
			await removeRoster.mutateAsync(assignmentMemberId);
		} catch (removeError) {
			setError(
				removeError instanceof Error
					? removeError.message
					: "Não foi possível remover da escala.",
			);
		}
	}

	return (
		<section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
			<header className="flex items-start gap-3 border-b border-border/60 bg-muted/25 px-5 py-4 sm:px-6">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
					<Users className="size-4" aria-hidden />
				</div>
				<div className="min-w-0">
					<h3 className="font-display text-base font-semibold tracking-tight">
						Escala deste dia
					</h3>
					<p className="mt-0.5 text-sm text-muted-foreground">
						Escala oficial do evento. Escolha entre quem marcou disponibilidade.
					</p>
				</div>
			</header>

			<div className="space-y-5 p-5 sm:p-6">
				{error && (
					<p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
						{error}
					</p>
				)}

				{event.roster.length === 0 ? (
					<div className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center">
						<ListChecks className="mx-auto size-7 text-muted-foreground" />
						<p className="mt-3 text-sm font-medium text-foreground">
							Escala ainda vazia
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							{canManage
								? "Adicione pessoas disponíveis da equipe abaixo."
								: "O líder ainda não montou a escala deste dia."}
						</p>
					</div>
				) : (
					<ul className="space-y-2">
						{event.roster.map((assignment) => (
							<li
								key={assignment.id}
								className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3"
							>
								<div className="min-w-0">
									<p className="font-medium text-foreground">
										{assignment.memberName}
									</p>
									<div className="mt-1 flex flex-wrap items-center gap-2">
										<Badge variant="secondary">{assignment.roleLabel}</Badge>
										<span
											className={cn(
												"text-xs",
												assignment.availabilityStatus === "available" &&
													"text-emerald-700 dark:text-emerald-300",
												assignment.availabilityStatus === "unavailable" &&
													"text-destructive",
												!assignment.availabilityStatus &&
													"text-muted-foreground",
											)}
										>
											{availabilityLabel(assignment.availabilityStatus)}
										</span>
									</div>
								</div>

								{canManage && (
									<Button
										type="button"
										size="sm"
										variant="ghost"
										className="text-muted-foreground hover:text-destructive"
										disabled={removeRoster.isPending}
										onClick={() => void handleRemove(assignment.memberId)}
										aria-label={`Remover ${assignment.memberName} da escala`}
									>
										<Trash2 className="size-4" />
									</Button>
								)}
							</li>
						))}
					</ul>
				)}

				{canManage && (
					<div className="space-y-3 rounded-2xl border border-border/70 bg-muted/10 p-4">
						<div>
							<p className="text-sm font-semibold text-foreground">
								Montar escala
							</p>
							<p className="mt-0.5 text-xs text-muted-foreground">
								Só aparecem pessoas que marcaram “posso ir”. A função vem do
								perfil de cada membro — peça para cadastrar funções em Escalas
								se a lista estiver vazia.
							</p>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<p className="text-xs font-medium text-muted-foreground">
									Pessoa
								</p>
								<SelectField
									value={memberId}
									onChange={(event) => {
										setMemberId(event.target.value);
										setRoleLabel("");
									}}
									disabled={upsertRoster.isPending}
								>
									<option value="">Selecione</option>
									{availableCandidates.map((candidate) => (
										<option key={candidate.memberId} value={candidate.memberId}>
											{candidate.memberName}
										</option>
									))}
								</SelectField>
							</div>

							<div className="space-y-1.5">
								<p className="text-xs font-medium text-muted-foreground">
									Função
								</p>
								{memberId && !memberHasFunctions ? (
									<p className="rounded-xl border border-dashed border-border bg-background px-3 py-2.5 text-xs text-muted-foreground">
										{selectedCandidate?.memberName} ainda não cadastrou funções
										na escala. Peça para preencher em Escalas → Seu perfil na
										escala.
									</p>
								) : (
									<SelectField
										value={roleLabel}
										onChange={(event) => setRoleLabel(event.target.value)}
										disabled={
											upsertRoster.isPending || !memberId || !memberHasFunctions
										}
									>
										<option value="">Selecione</option>
										{roleOptions.map((role) => (
											<option key={role} value={role}>
												{role}
											</option>
										))}
									</SelectField>
								)}
							</div>
						</div>

						<Button
							type="button"
							size="sm"
							onClick={() => void handleAdd()}
							disabled={
								upsertRoster.isPending ||
								!memberId ||
								!roleLabel ||
								!memberHasFunctions
							}
						>
							<Plus className="size-4" />
							{upsertRoster.isPending ? "Adicionando..." : "Adicionar à escala"}
						</Button>
					</div>
				)}
			</div>
		</section>
	);
}
