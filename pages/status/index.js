import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>status page</h1>
      <UpdatedAt />
      <h1>Database</h1>
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let UpdatedAtText = "carregando";
  if (!isLoading && data) {
    UpdatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {UpdatedAtText}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let databaseStatusInformation = "carregando";
  if (!isLoading && data) {
    databaseStatusInformation = (
      <>
        <div>Versão: {data.dependecies.database.version}</div>
        <div>
          Conexões abertas: {data.dependecies.database.opened_connections}
        </div>
        <div>Conexões Máxima: {data.dependecies.database.max_connections}</div>
      </>
    );
  }

  return databaseStatusInformation;
}
