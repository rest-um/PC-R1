import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { UtensilsCrossed, Coffee, Package, Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HelpButton } from "@/components/HelpButton";

const Cardapio = () => {
  const queryClient = useQueryClient();
  
  const [pratoDialogOpen, setPratoDialogOpen] = useState(false);
  const [bebidaDialogOpen, setBebidaDialogOpen] = useState(false);
  const [outroProdutoDialogOpen, setOutroProdutoDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [editingPrato, setEditingPrato] = useState<{ id: number; nome_do_prato: string | null; descricao: string | null; preco: number | null; disponivel: boolean } | null>(null);
  const [editingBebida, setEditingBebida] = useState<{ id: number; nome: string | null; tipo: string | null; tamanho: string | null; valor: number | null } | null>(null);
  const [editingOutroProduto, setEditingOutroProduto] = useState<{ id: number; produto: string | null; descricao: string | null; tipo: string | null; valor: number | null; disponivel: boolean | null } | null>(null);
  
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'prato' | 'bebida' | 'outro'; id: number; name: string } | null>(null);
  
  const [pratoForm, setPratoForm] = useState({ nome_do_prato: "", descricao: "", preco: "" });
  const [bebidaForm, setBebidaForm] = useState({ nome: "", tipo: "", tamanho: "", valor: "" });
  const [outroProdutoForm, setOutroProdutoForm] = useState({ produto: "", descricao: "", tipo: "", valor: "" });

  const { data: cardapio, isLoading: loadingCardapio } = useQuery({
    queryKey: ["cardapio"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cardapio").select("*").order("nome_do_prato");
      if (error) throw error;
      return data;
    },
  });

  const { data: bebidas, isLoading: loadingBebidas } = useQuery({
    queryKey: ["bebidas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bebidas").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: outrosProdutos } = useQuery({
    queryKey: ["outros_produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("outros_produtos").select("*").order("produto");
      if (error) throw error;
      return data;
    },
  });

  const savePratoMutation = useMutation({
    mutationFn: async (prato: { id?: number; nome_do_prato: string; descricao: string; preco: number }) => {
      if (prato.id) {
        const { error } = await supabase.from("cardapio").update({
          nome_do_prato: prato.nome_do_prato,
          descricao: prato.descricao,
          preco: prato.preco,
        }).eq("id", prato.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cardapio").insert({
          nome_do_prato: prato.nome_do_prato,
          descricao: prato.descricao,
          preco: prato.preco,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardapio"] });
      toast.success(editingPrato ? "Prato atualizado!" : "Prato adicionado!");
      setPratoDialogOpen(false);
      setEditingPrato(null);
      setPratoForm({ nome_do_prato: "", descricao: "", preco: "" });
    },
    onError: () => toast.error("Erro ao salvar prato"),
  });

  const saveBebidaMutation = useMutation({
    mutationFn: async (bebida: { id?: number; nome: string; tipo: string; tamanho: string; valor: number }) => {
      if (bebida.id) {
        const { error } = await supabase.from("bebidas").update({
          nome: bebida.nome, tipo: bebida.tipo, tamanho: bebida.tamanho, valor: bebida.valor,
        }).eq("id", bebida.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bebidas").insert({
          nome: bebida.nome, tipo: bebida.tipo, tamanho: bebida.tamanho, valor: bebida.valor,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bebidas"] });
      toast.success(editingBebida ? "Bebida atualizada!" : "Bebida adicionada!");
      setBebidaDialogOpen(false);
      setEditingBebida(null);
      setBebidaForm({ nome: "", tipo: "", tamanho: "", valor: "" });
    },
    onError: () => toast.error("Erro ao salvar bebida"),
  });

  const saveOutroProdutoMutation = useMutation({
    mutationFn: async (outro: { id?: number; produto: string; descricao: string; tipo: string; valor: number }) => {
      if (outro.id) {
        const { error } = await supabase.from("outros_produtos").update({
          produto: outro.produto, descricao: outro.descricao, tipo: outro.tipo, valor: outro.valor,
        }).eq("id", outro.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("outros_produtos").insert({
          produto: outro.produto, descricao: outro.descricao, tipo: outro.tipo, valor: outro.valor,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outros_produtos"] });
      toast.success(editingOutroProduto ? "Produto atualizado!" : "Produto adicionado!");
      setOutroProdutoDialogOpen(false);
      setEditingOutroProduto(null);
      setOutroProdutoForm({ produto: "", descricao: "", tipo: "", valor: "" });
    },
    onError: () => toast.error("Erro ao salvar produto"),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'prato' | 'bebida' | 'outro'; id: number }) => {
      const table = type === 'prato' ? 'cardapio' : type === 'bebida' ? 'bebidas' : 'outros_produtos';
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardapio"] });
      queryClient.invalidateQueries({ queryKey: ["bebidas"] });
      queryClient.invalidateQueries({ queryKey: ["outros_produtos"] });
      toast.success("Item excluído!");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao excluir item"),
  });

  const togglePratoDisponibilidadeMutation = useMutation({
    mutationFn: async ({ id, disponivel }: { id: number; disponivel: boolean }) => {
      const { error } = await supabase.from("cardapio").update({ disponivel }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cardapio"] }),
    onError: () => toast.error("Erro ao atualizar disponibilidade"),
  });

  const toggleBebidaDisponibilidadeMutation = useMutation({
    mutationFn: async ({ id, disponivel }: { id: number; disponivel: boolean }) => {
      const { error } = await supabase.from("bebidas").update({ disponivel }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bebidas"] }),
    onError: () => toast.error("Erro ao atualizar disponibilidade"),
  });

  const toggleOutroProdutoDisponibilidadeMutation = useMutation({
    mutationFn: async ({ id, disponivel }: { id: number; disponivel: boolean }) => {
      const { error } = await supabase.from("outros_produtos").update({ disponivel }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outros_produtos"] }),
    onError: () => toast.error("Erro ao atualizar disponibilidade"),
  });

  const isLoading = loadingCardapio || loadingBebidas;

  const formatPrice = (price: number | null) => {
    if (!price) return "R$ 0,00";
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  const openEditPrato = (prato: NonNullable<typeof cardapio>[number]) => {
    setEditingPrato(prato);
    setPratoForm({
      nome_do_prato: prato.nome_do_prato || "",
      descricao: prato.descricao || "",
      preco: prato.preco?.toString() || "",
    });
    setPratoDialogOpen(true);
  };

  const openEditBebida = (bebida: NonNullable<typeof bebidas>[number]) => {
    setEditingBebida(bebida);
    setBebidaForm({
      nome: bebida.nome || "", tipo: bebida.tipo || "", tamanho: bebida.tamanho || "", valor: bebida.valor?.toString() || "",
    });
    setBebidaDialogOpen(true);
  };

  const openEditOutroProduto = (outro: NonNullable<typeof outrosProdutos>[number]) => {
    setEditingOutroProduto(outro);
    setOutroProdutoForm({
      produto: outro.produto || "", descricao: outro.descricao || "", tipo: outro.tipo || "", valor: outro.valor?.toString() || "",
    });
    setOutroProdutoDialogOpen(true);
  };

  const openNewPrato = () => { setEditingPrato(null); setPratoForm({ nome_do_prato: "", descricao: "", preco: "" }); setPratoDialogOpen(true); };
  const openNewBebida = () => { setEditingBebida(null); setBebidaForm({ nome: "", tipo: "", tamanho: "", valor: "" }); setBebidaDialogOpen(true); };
  const openNewOutroProduto = () => { setEditingOutroProduto(null); setOutroProdutoForm({ produto: "", descricao: "", tipo: "", valor: "" }); setOutroProdutoDialogOpen(true); };

  const confirmDelete = (type: 'prato' | 'bebida' | 'outro', id: number, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleSavePrato = () => {
    savePratoMutation.mutate({
      id: editingPrato?.id,
      nome_do_prato: pratoForm.nome_do_prato,
      descricao: pratoForm.descricao,
      preco: parseFloat(pratoForm.preco.replace(",", ".")) || 0,
    });
  };

  const handleSaveBebida = () => {
    saveBebidaMutation.mutate({
      id: editingBebida?.id,
      nome: bebidaForm.nome, tipo: bebidaForm.tipo, tamanho: bebidaForm.tamanho,
      valor: parseFloat(bebidaForm.valor.replace(",", ".")) || 0,
    });
  };

  const handleSaveOutroProduto = () => {
    saveOutroProdutoMutation.mutate({
      id: editingOutroProduto?.id,
      produto: outroProdutoForm.produto, descricao: outroProdutoForm.descricao, tipo: outroProdutoForm.tipo,
      valor: parseFloat(outroProdutoForm.valor.replace(",", ".")) || 0,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2"><span className="neon-text-cyan">Cardápio</span></h2>
          <p className="text-muted-foreground">Gerencie os itens do seu cardápio</p>
        </div>
        <HelpButton section="cardapio" />
      </div>

      <Tabs defaultValue="pratos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="pratos" className="data-[state=active]:bg-primary/20"><UtensilsCrossed className="h-4 w-4 mr-2" />Pratos</TabsTrigger>
          <TabsTrigger value="bebidas" className="data-[state=active]:bg-secondary/20"><Coffee className="h-4 w-4 mr-2" />Bebidas</TabsTrigger>
          <TabsTrigger value="outros" className="data-[state=active]:bg-accent/20"><Package className="h-4 w-4 mr-2" />Outros</TabsTrigger>
        </TabsList>

        <TabsContent value="pratos" className="mt-6">
          <Card className="glass-card neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pratos do Cardápio</CardTitle>
                <CardDescription>{cardapio?.length || 0} itens cadastrados</CardDescription>
              </div>
              <Button onClick={openNewPrato} className="neon-glow-cyan"><Plus className="h-4 w-4 mr-2" />Novo Prato</Button>
            </CardHeader>
            <CardContent>
              {cardapio && cardapio.length > 0 ? (
                <div className="grid gap-4">
                  {cardapio.map((item) => (
                    <div key={item.id} className={`p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors ${!item.disponivel ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{item.nome_do_prato}</h4>
                        {!item.disponivel && <Badge variant="secondary" className="text-xs">Indisponível</Badge>}
                      </div>
                      {item.descricao && <p className="text-sm text-muted-foreground px-1 mb-3">{item.descricao}</p>}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Switch checked={item.disponivel} onCheckedChange={(checked) => togglePratoDisponibilidadeMutation.mutate({ id: item.id, disponivel: checked })} />
                          <span className="text-xs text-muted-foreground hidden sm:inline">{item.disponivel ? 'Disponível' : 'Indisponível'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="neon-text-cyan">{formatPrice(item.preco)}</Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditPrato(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete('prato', item.id, item.nome_do_prato || 'Item')}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum prato cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bebidas" className="mt-6">
          <Card className="glass-card neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bebidas</CardTitle>
                <CardDescription>{bebidas?.length || 0} bebidas cadastradas</CardDescription>
              </div>
              <Button onClick={openNewBebida} className="neon-glow-magenta"><Plus className="h-4 w-4 mr-2" />Nova Bebida</Button>
            </CardHeader>
            <CardContent>
              {bebidas && bebidas.length > 0 ? (
                <div className="grid gap-4">
                  {bebidas.map((bebida) => (
                    <div key={bebida.id} className={`p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-secondary/50 transition-colors ${!bebida.disponivel ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{bebida.nome}</h4>
                        {!bebida.disponivel && <Badge variant="secondary" className="text-xs">Indisponível</Badge>}
                      </div>
                      <div className="flex gap-2 mb-3">
                        {bebida.tipo && <Badge variant="secondary">{bebida.tipo}</Badge>}
                        {bebida.tamanho && <Badge variant="outline">{bebida.tamanho}</Badge>}
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Switch checked={bebida.disponivel} onCheckedChange={(checked) => toggleBebidaDisponibilidadeMutation.mutate({ id: bebida.id, disponivel: checked })} />
                          <span className="text-xs text-muted-foreground hidden sm:inline">{bebida.disponivel ? 'Disponível' : 'Indisponível'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="neon-text-magenta">{formatPrice(bebida.valor)}</Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditBebida(bebida)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete('bebida', bebida.id, bebida.nome || 'Item')}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Coffee className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma bebida cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outros" className="mt-6">
          <Card className="glass-card neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Outros Produtos</CardTitle>
                <CardDescription>{outrosProdutos?.length || 0} produtos cadastrados</CardDescription>
              </div>
              <Button onClick={openNewOutroProduto} className="neon-glow-green"><Plus className="h-4 w-4 mr-2" />Novo Produto</Button>
            </CardHeader>
            <CardContent>
              {outrosProdutos && outrosProdutos.length > 0 ? (
                <div className="grid gap-4">
                  {outrosProdutos.map((outro) => (
                    <div key={outro.id} className={`p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-accent/50 transition-colors ${!outro.disponivel ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{outro.produto}</h4>
                        {!outro.disponivel && <Badge variant="secondary" className="text-xs">Indisponível</Badge>}
                      </div>
                      {outro.descricao && <p className="text-sm text-muted-foreground px-1 mb-3">{outro.descricao}</p>}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Switch checked={outro.disponivel ?? true} onCheckedChange={(checked) => toggleOutroProdutoDisponibilidadeMutation.mutate({ id: outro.id, disponivel: checked })} />
                          <span className="text-xs text-muted-foreground hidden sm:inline">{outro.disponivel ? 'Disponível' : 'Indisponível'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {outro.tipo && <Badge variant="secondary">{outro.tipo}</Badge>}
                          <Badge variant="outline" className="neon-text-green">{formatPrice(outro.valor)}</Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditOutroProduto(outro)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete('outro', outro.id, outro.produto || 'Item')}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum produto cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Prato */}
      <Dialog open={pratoDialogOpen} onOpenChange={setPratoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPrato ? "Editar Prato" : "Novo Prato"}</DialogTitle>
            <DialogDescription>Preencha as informações do prato</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome do Prato</Label><Input value={pratoForm.nome_do_prato} onChange={(e) => setPratoForm({ ...pratoForm, nome_do_prato: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea value={pratoForm.descricao} onChange={(e) => setPratoForm({ ...pratoForm, descricao: e.target.value })} /></div>
            <div><Label>Preço</Label><Input value={pratoForm.preco} onChange={(e) => setPratoForm({ ...pratoForm, preco: e.target.value })} placeholder="0,00" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPratoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePrato}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Bebida */}
      <Dialog open={bebidaDialogOpen} onOpenChange={setBebidaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBebida ? "Editar Bebida" : "Nova Bebida"}</DialogTitle>
            <DialogDescription>Preencha as informações da bebida</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={bebidaForm.nome} onChange={(e) => setBebidaForm({ ...bebidaForm, nome: e.target.value })} /></div>
            <div><Label>Tipo</Label><Input value={bebidaForm.tipo} onChange={(e) => setBebidaForm({ ...bebidaForm, tipo: e.target.value })} placeholder="Ex: Refrigerante, Suco..." /></div>
            <div><Label>Tamanho</Label><Input value={bebidaForm.tamanho} onChange={(e) => setBebidaForm({ ...bebidaForm, tamanho: e.target.value })} placeholder="Ex: 350ml, 1L..." /></div>
            <div><Label>Valor</Label><Input value={bebidaForm.valor} onChange={(e) => setBebidaForm({ ...bebidaForm, valor: e.target.value })} placeholder="0,00" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBebidaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveBebida}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Outro Produto */}
      <Dialog open={outroProdutoDialogOpen} onOpenChange={setOutroProdutoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOutroProduto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>Preencha as informações do produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome do Produto</Label><Input value={outroProdutoForm.produto} onChange={(e) => setOutroProdutoForm({ ...outroProdutoForm, produto: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea value={outroProdutoForm.descricao} onChange={(e) => setOutroProdutoForm({ ...outroProdutoForm, descricao: e.target.value })} /></div>
            <div><Label>Tipo</Label><Input value={outroProdutoForm.tipo} onChange={(e) => setOutroProdutoForm({ ...outroProdutoForm, tipo: e.target.value })} placeholder="Ex: Sobremesa, Acompanhamento..." /></div>
            <div><Label>Valor</Label><Input value={outroProdutoForm.valor} onChange={(e) => setOutroProdutoForm({ ...outroProdutoForm, valor: e.target.value })} placeholder="0,00" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutroProdutoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveOutroProduto}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate({ type: deleteTarget.type, id: deleteTarget.id })}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cardapio;
