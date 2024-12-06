import os
# export MASTER_ADDR=localhost export MASTER_PORT=5678
os.environ["MASTER_ADDR"] = "localhost"
os.environ["MASTER_PORT"] = "5678"

# On worker 0:
import torch
import torch.distributed.rpc as rpc
rpc.init_rpc("worker0", rank=0, world_size=3)
ret1 = rpc.rpc_sync("worker1", torch.add, args=(2, 3))
ret2 = rpc.rpc_sync("worker2", torch.mul, args=(2, 3))


rpc.shutdown()
