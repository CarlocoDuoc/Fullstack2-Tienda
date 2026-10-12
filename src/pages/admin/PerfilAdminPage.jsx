import PerfilForm from "../../components/PerfilForm";

export default function PerfilAdminPage() {
  return (
    <>
      <h1 className="h3 mb-3">Mi perfil</h1>
      <div className="bg-white border rounded p-3 p-md-4" style={{ maxWidth: 800 }}>
        <PerfilForm />
      </div>
    </>
  );
}
