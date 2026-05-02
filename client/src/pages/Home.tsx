import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, Plus, Edit2, Trash2, Search, Code2, Users } from "lucide-react";
import { useState } from "react";

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  direccion: {
    ciudad: string;
    pais: string;
  };
  pedidos: Array<{
    id: string;
    producto: string;
    cantidad: number;
    precio: number;
  }>;
}

const clientesIniciales: Cliente[] = [
  {
    id: "1",
    nombre: "Juan Pérez",
    email: "juan.perez@email.com",
    direccion: { ciudad: "Santiago", pais: "Chile" },
    pedidos: [
      { id: "p1", producto: "Laptop Gamer", cantidad: 1, precio: 1500 },
      { id: "p2", producto: "Mouse Inalámbrico", cantidad: 2, precio: 25 },
    ],
  },
  {
    id: "2",
    nombre: "María González",
    email: "maria.gonzalez@email.com",
    direccion: { ciudad: "Valparaíso", pais: "Chile" },
    pedidos: [{ id: "p3", producto: "Monitor 27 pulgadas", cantidad: 1, precio: 300 }],
  },
  {
    id: "3",
    nombre: "Carlos López",
    email: "carlos.lopez@email.com",
    direccion: { ciudad: "Santiago", pais: "Chile" },
    pedidos: [
      { id: "p4", producto: "Teclado Mecánico", cantidad: 1, precio: 80 },
      { id: "p5", producto: "Auriculares Bluetooth", cantidad: 1, precio: 120 },
    ],
  },
];

export default function Home() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciales);
  const [comandos, setComandos] = useState<string[]>([]);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", email: "", ciudad: "", pais: "" });
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [ciudadBusqueda, setCiudadBusqueda] = useState("");

  const agregarComando = (comando: string) => {
    setComandos((prev) => [...prev, comando]);
  };

  const crearCliente = () => {
    if (!nuevoCliente.nombre || !nuevoCliente.email || !nuevoCliente.ciudad) return;

    const comando = `db.clientes.insertOne({
  nombre: "${nuevoCliente.nombre}",
  email: "${nuevoCliente.email}",
  direccion: { ciudad: "${nuevoCliente.ciudad}", pais: "${nuevoCliente.pais}" },
  pedidos: []
})`;

    const nuevoId = (Math.max(...clientes.map((c) => parseInt(c.id)), 0) + 1).toString();
    setClientes((prev) => [
      ...prev,
      {
        id: nuevoId,
        nombre: nuevoCliente.nombre,
        email: nuevoCliente.email,
        direccion: { ciudad: nuevoCliente.ciudad, pais: nuevoCliente.pais },
        pedidos: [],
      },
    ]);

    agregarComando(comando);
    setNuevoCliente({ nombre: "", email: "", ciudad: "", pais: "" });
  };

  const actualizarDireccion = (clienteId: string, nuevaCiudad: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return;

    const comando = `db.clientes.updateOne(
  { email: "${cliente.email}" },
  { $set: { "direccion.ciudad": "${nuevaCiudad}" } }
)`;

    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId ? { ...c, direccion: { ...c.direccion, ciudad: nuevaCiudad } } : c
      )
    );

    agregarComando(comando);
  };

  const eliminarPedido = (clienteId: string, pedidoId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    const pedido = cliente?.pedidos.find((p) => p.id === pedidoId);
    if (!cliente || !pedido) return;

    const comando = `db.clientes.updateOne(
  { email: "${cliente.email}" },
  { $pull: { pedidos: { producto: "${pedido.producto}" } } }
)`;

    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId ? { ...c, pedidos: c.pedidos.filter((p) => p.id !== pedidoId) } : c
      )
    );

    agregarComando(comando);
  };

  const eliminarCliente = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return;

    const comando = `db.clientes.deleteOne({ email: "${cliente.email}" })`;

    setClientes((prev) => prev.filter((c) => c.id !== clienteId));
    agregarComando(comando);
    setClienteSeleccionado(null);
  };

  const clientesFiltrados = ciudadBusqueda
    ? clientes.filter((c) => c.direccion.ciudad.toLowerCase().includes(ciudadBusqueda.toLowerCase()))
    : clientes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">MongoDB CRUD Demo</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Sistema Interactivo de Tienda en Línea</p>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs de Operaciones */}
            <Tabs defaultValue="crear" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="crear">Crear</TabsTrigger>
                <TabsTrigger value="leer">Leer</TabsTrigger>
                <TabsTrigger value="actualizar">Actualizar</TabsTrigger>
                <TabsTrigger value="eliminar">Eliminar</TabsTrigger>
              </TabsList>

              {/* CREATE */}
              <TabsContent value="crear" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Crear Nuevo Cliente
                    </CardTitle>
                    <CardDescription>Inserta un nuevo documento en la colección clientes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          placeholder="Ej: Juan Pérez"
                          value={nuevoCliente.nombre}
                          onChange={(e) => setNuevoCliente((prev) => ({ ...prev, nombre: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          placeholder="Ej: juan@email.com"
                          value={nuevoCliente.email}
                          onChange={(e) => setNuevoCliente((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ciudad">Ciudad</Label>
                        <Input
                          id="ciudad"
                          placeholder="Ej: Santiago"
                          value={nuevoCliente.ciudad}
                          onChange={(e) => setNuevoCliente((prev) => ({ ...prev, ciudad: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pais">País</Label>
                        <Input
                          id="pais"
                          placeholder="Ej: Chile"
                          value={nuevoCliente.pais}
                          onChange={(e) => setNuevoCliente((prev) => ({ ...prev, pais: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={crearCliente} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Cliente
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* READ */}
              <TabsContent value="leer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Buscar Clientes por Ciudad
                    </CardTitle>
                    <CardDescription>Utiliza filtros para consultar documentos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="busqueda">Ciudad</Label>
                      <Input
                        id="busqueda"
                        placeholder="Ej: Santiago"
                        value={ciudadBusqueda}
                        onChange={(e) => setCiudadBusqueda(e.target.value)}
                      />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                      <p className="text-sm font-mono text-slate-600 dark:text-slate-400 mb-3">
                        db.clientes.find({'{"direccion.ciudad": "{ciudadBusqueda}"}'}).pretty()
                      </p>
                      <div className="space-y-2">
                        {clientesFiltrados.length > 0 ? (
                          clientesFiltrados.map((cliente) => (
                            <div key={cliente.id} className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                              <p className="font-semibold text-slate-900 dark:text-white">{cliente.nombre}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{cliente.email}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-500">
                                {cliente.direccion.ciudad}, {cliente.direccion.pais}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-sm">No hay resultados</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* UPDATE */}
              <TabsContent value="actualizar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit2 className="w-5 h-5" />
                      Actualizar Dirección
                    </CardTitle>
                    <CardDescription>Modifica el subdocumento dirección de un cliente</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Selecciona un cliente</Label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {clientes.map((cliente) => (
                          <div
                            key={cliente.id}
                            onClick={() => setClienteSeleccionado(cliente.id)}
                            className={`p-3 rounded border cursor-pointer transition ${
                              clienteSeleccionado === cliente.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                            }`}
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">{cliente.nombre}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{cliente.direccion.ciudad}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {clienteSeleccionado && (
                      <div>
                        <Label htmlFor="nueva-ciudad">Nueva Ciudad</Label>
                        <div className="flex gap-2">
                          <Input
                            id="nueva-ciudad"
                            placeholder="Ej: Viña del Mar"
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && e.currentTarget.value) {
                                actualizarDireccion(clienteSeleccionado, e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                          <Button
                            onClick={(e) => {
                              const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                              if (input.value) {
                                actualizarDireccion(clienteSeleccionado, input.value);
                                input.value = "";
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Actualizar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DELETE */}
              <TabsContent value="eliminar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trash2 className="w-5 h-5 text-red-600" />
                      Eliminar Datos
                    </CardTitle>
                    <CardDescription>Elimina clientes o pedidos específicos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="pedidos" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pedidos">Eliminar Pedido</TabsTrigger>
                        <TabsTrigger value="cliente">Eliminar Cliente</TabsTrigger>
                      </TabsList>

                      <TabsContent value="pedidos" className="space-y-4">
                        <div>
                          <Label>Selecciona un cliente</Label>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {clientes.map((cliente) => (
                              <div key={cliente.id} className="border border-slate-200 dark:border-slate-700 rounded p-3">
                                <p className="font-semibold text-slate-900 dark:text-white mb-2">{cliente.nombre}</p>
                                {cliente.pedidos.length > 0 ? (
                                  <div className="space-y-2">
                                    {cliente.pedidos.map((pedido) => (
                                      <div key={pedido.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{pedido.producto}</span>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => eliminarPedido(cliente.id, pedido.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500 dark:text-slate-400">Sin pedidos</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="cliente" className="space-y-4">
                        <div>
                          <Label>Selecciona un cliente para eliminar</Label>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {clientes.map((cliente) => (
                              <div
                                key={cliente.id}
                                className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded p-3 hover:bg-red-50 dark:hover:bg-red-950 transition"
                              >
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{cliente.nombre}</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{cliente.email}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => eliminarCliente(cliente.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Consola de Comandos */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Consola MongoDB
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto space-y-2">
                  {comandos.length === 0 ? (
                    <p className="text-slate-500">// Los comandos aparecerán aquí...</p>
                  ) : (
                    comandos.map((cmd, idx) => (
                      <pre key={idx} className="text-green-400 whitespace-pre-wrap break-words">
                        {cmd}
                      </pre>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Clientes:</span>
                  <Badge variant="secondary">{clientes.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Pedidos:</span>
                  <Badge variant="secondary">{clientes.reduce((sum, c) => sum + c.pedidos.length, 0)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Comandos Ejecutados:</span>
                  <Badge variant="secondary">{comandos.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Ciudades Únicas:</span>
                  <Badge variant="secondary">{new Set(clientes.map((c) => c.direccion.ciudad)).size}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
