import { PainelExportacao } from "@/components/painel-exportacao";
import { Screen } from "@/components/screen";
import { BackButton } from "@/components/ui";
import { exportarRelatorioPedidos } from "@/lib/api";

/** Exportacao dos pedidos em JSON pela area do cliente (item 2.2 do roteiro). */
export default function ExportarDadosScreen() {
  return (
    <Screen>
      <BackButton label="Voltar" />
      <PainelExportacao exportar={exportarRelatorioPedidos} />
    </Screen>
  );
}
