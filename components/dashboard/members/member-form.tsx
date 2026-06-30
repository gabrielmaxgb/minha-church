"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  MEMBER_STATUS_FORM_LABELS,
  type MemberFormValues,
} from "@/lib/members/form";
import type { Gender, MaritalStatus, MemberStatus } from "@/types/members";

interface MemberFormProps {
  values: MemberFormValues;
  onChange: (values: MemberFormValues) => void;
  disabled?: boolean;
  showStatus?: boolean;
}

function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function updateField<K extends keyof MemberFormValues>(
  values: MemberFormValues,
  onChange: (values: MemberFormValues) => void,
  field: K,
  value: MemberFormValues[K],
) {
  const next = { ...values, [field]: value };

  if (field === "maritalStatus" && value !== "married") {
    next.weddingAnniversary = "";
  }

  onChange(next);
}

export function MemberForm({
  values,
  onChange,
  disabled = false,
  showStatus = true,
}: MemberFormProps) {
  return (
    <div className="space-y-8">
      <FieldGroup title="Identificação" description="Dados principais de contato.">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="member-name">Nome completo</Label>
          <Input
            id="member-name"
            value={values.name}
            onChange={(event) =>
              updateField(values, onChange, "name", event.target.value)
            }
            placeholder="Nome da pessoa"
            disabled={disabled}
            required
          />
        </div>

        {showStatus && (
          <div className="space-y-2">
            <Label htmlFor="member-status">Status</Label>
            <SelectField
              id="member-status"
              value={values.status}
              onChange={(event) =>
                updateField(
                  values,
                  onChange,
                  "status",
                  event.target.value as MemberStatus,
                )
              }
              disabled={disabled}
            >
              {(Object.keys(MEMBER_STATUS_FORM_LABELS) as MemberStatus[]).map(
                (status) => (
                  <option key={status} value={status}>
                    {MEMBER_STATUS_FORM_LABELS[status]}
                  </option>
                ),
              )}
            </SelectField>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="member-email">E-mail</Label>
          <Input
            id="member-email"
            type="email"
            value={values.email}
            onChange={(event) =>
              updateField(values, onChange, "email", event.target.value)
            }
            placeholder="email@exemplo.com"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-phone">Telefone</Label>
          <Input
            id="member-phone"
            value={values.phone}
            onChange={(event) =>
              updateField(values, onChange, "phone", event.target.value)
            }
            placeholder="(00) 00000-0000"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-phone-secondary">Telefone secundário</Label>
          <Input
            id="member-phone-secondary"
            value={values.phoneSecondary}
            onChange={(event) =>
              updateField(values, onChange, "phoneSecondary", event.target.value)
            }
            disabled={disabled}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Dados pessoais">
        <div className="space-y-2">
          <Label htmlFor="member-birth-date">Data de nascimento</Label>
          <Input
            id="member-birth-date"
            type="date"
            value={values.birthDate}
            onChange={(event) =>
              updateField(values, onChange, "birthDate", event.target.value)
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-gender">Gênero</Label>
          <SelectField
            id="member-gender"
            value={values.gender}
            onChange={(event) =>
              updateField(
                values,
                onChange,
                "gender",
                event.target.value as Gender | "",
              )
            }
            disabled={disabled}
          >
            <option value="">Não informado</option>
            {(Object.keys(GENDER_LABELS) as Gender[]).map((gender) => (
              <option key={gender} value={gender}>
                {GENDER_LABELS[gender]}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-marital-status">Estado civil</Label>
          <SelectField
            id="member-marital-status"
            value={values.maritalStatus}
            onChange={(event) =>
              updateField(
                values,
                onChange,
                "maritalStatus",
                event.target.value as MaritalStatus | "",
              )
            }
            disabled={disabled}
          >
            <option value="">Não informado</option>
            {(Object.keys(MARITAL_STATUS_LABELS) as MaritalStatus[]).map(
              (status) => (
                <option key={status} value={status}>
                  {MARITAL_STATUS_LABELS[status]}
                </option>
              ),
            )}
          </SelectField>
        </div>

        {values.maritalStatus === "married" && (
          <div className="space-y-2">
            <Label htmlFor="member-wedding-anniversary">
              Aniversário de casamento
            </Label>
            <Input
              id="member-wedding-anniversary"
              type="date"
              value={values.weddingAnniversary}
              onChange={(event) =>
                updateField(
                  values,
                  onChange,
                  "weddingAnniversary",
                  event.target.value,
                )
              }
              disabled={disabled}
            />
          </div>
        )}
      </FieldGroup>

      <FieldGroup title="Endereço">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="member-street">Rua</Label>
          <Input
            id="member-street"
            value={values.street}
            onChange={(event) =>
              updateField(values, onChange, "street", event.target.value)
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-number">Número</Label>
          <Input
            id="member-number"
            value={values.number}
            onChange={(event) =>
              updateField(values, onChange, "number", event.target.value)
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-complement">Complemento</Label>
          <Input
            id="member-complement"
            value={values.complement}
            onChange={(event) =>
              updateField(values, onChange, "complement", event.target.value)
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-neighborhood">Bairro</Label>
          <Input
            id="member-neighborhood"
            value={values.neighborhood}
            onChange={(event) =>
              updateField(values, onChange, "neighborhood", event.target.value)
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-city">Cidade</Label>
          <Input
            id="member-city"
            value={values.city}
            onChange={(event) =>
              updateField(values, onChange, "city", event.target.value)
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-state">Estado</Label>
          <Input
            id="member-state"
            value={values.state}
            onChange={(event) =>
              updateField(values, onChange, "state", event.target.value)
            }
            placeholder="SP"
            maxLength={2}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-zip-code">CEP</Label>
          <Input
            id="member-zip-code"
            value={values.zipCode}
            onChange={(event) =>
              updateField(values, onChange, "zipCode", event.target.value)
            }
            disabled={disabled}
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Vida na igreja"
        description="Datas importantes no histórico pastoral."
      >
        <div className="space-y-2">
          <Label htmlFor="member-visitor-since">Visitante desde</Label>
          <Input
            id="member-visitor-since"
            type="date"
            value={values.visitorSince}
            onChange={(event) =>
              updateField(values, onChange, "visitorSince", event.target.value)
            }
            disabled={disabled || values.status !== "visitor"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-membership-date">Membro desde</Label>
          <Input
            id="member-membership-date"
            type="date"
            value={values.membershipDate}
            onChange={(event) =>
              updateField(values, onChange, "membershipDate", event.target.value)
            }
            disabled={disabled || values.status !== "active"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-baptism-date">Data de batismo</Label>
          <Input
            id="member-baptism-date"
            type="date"
            value={values.baptismDate}
            onChange={(event) =>
              updateField(values, onChange, "baptismDate", event.target.value)
            }
            disabled={disabled}
          />
        </div>
      </FieldGroup>
    </div>
  );
}
