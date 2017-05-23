import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.StringJoiner;
import java.util.Arrays;

class Player {
  private static final Scanner IN = new Scanner(System.in);
  static final int INCREASE_TSD = 15;
  static final float ATT_UNITS_TSD = 0.1f;
  static final float IGNORE_TSD = 0.2f;
  static final List<Query> queries = new ArrayList<>();

  public static void main(String args[]) {
    List<Factory> factories = new ArrayList<>();

    init(factories);

    while (true) {
      StringJoiner actions = new StringJoiner(";");
      updateModel(factories);

      int avg = (int) factories.stream()
          .filter(f -> f.owner == 1)
          .mapToInt(f -> f.virtualStock)
          .average()
          .orElse(0);
      System.err.println(avg);

      factories.stream()
          .filter(f -> f.owner == 1)
          .forEach(f -> f.update(avg));

      Query[] offers = queries.stream()
          .filter(q -> q.nb > 0)
          .sorted((q1, q2) -> q2.nb - q1.nb)
          .toArray(Query[]::new);

      Query[] demands = queries.stream()
          .filter(q -> q.nb < 0)
          .sorted((q1, q2) -> q2.nb - q1.nb)
          .toArray(Query[]::new);

      for (Query d : demands) {
        for (Query o : offers) {
          if (o.nb == 0) continue;
          int toSend = 0;
          if (o.nb >= d.nb) {
            toSend = d.nb;
           o.nb -= toSend;
           d.nb = 0;
          }
          else {
            toSend = o.nb;
            o.nb = 0;
            d.nb -= toSend;
          }
          actions.add(move(o.factory.id, d.factory.id, toSend));
          o.factory.virtualStock -= toSend;
          d.factory.virtualStock += toSend;
          if (d.nb == 0) break;
        }
      }

      Query[] attackUnits = Arrays.stream(offers)
        .filter(q -> q.nb > 0)
        .toArray(Query[]::new);
      Factory[] targets = factories.stream()
        .filter(f -> f.owner != 1)
        .sorted((f1, f2) -> f1.virtualStock - f2.virtualStock)
        .toArray(Factory[]::new);

      for (Factory f : targets) {
          for (Query q : attackUnits) {

          }
      }

      System.out.println(actions);
    }
  }

  private static void init(List<Factory> factories) {
    int factoryCount = IN.nextInt();
    int linkCount = IN.nextInt();

    for (int i = 0; i < factoryCount; i++)
      factories.add(new Factory(i));

    for (int i = 0; i < linkCount; i++) {
      int factory1 = IN.nextInt();
      int factory2 = IN.nextInt();
      int distance = IN.nextInt();

      Factory f1 = factories.get(factory1);
      Factory f2 = factories.get(factory2);
      f1.neighbors.put(f2, distance);
      f2.neighbors.put(f1, distance);
    }
  }

  private static void updateModel(List<Factory> factories) {
    int entityCount = IN.nextInt();

    for (int i = 0; i < entityCount; i++) {
      int entityId = IN.nextInt();
      String entityType = IN.next();
      int arg1 = IN.nextInt();
      int arg2 = IN.nextInt();
      int arg3 = IN.nextInt();
      int arg4 = IN.nextInt();
      int arg5 = IN.nextInt();

      if (entityType.equals("FACTORY")) {
        Factory f = factories.get(entityId);
        int diff = f.virtualStock - f.stock;

        f.owner = arg1;
        f.stock = arg2;
        f.prod = arg3;
        f.virtualStock = arg2 + diff;
      }
    }
  }

    private static String move(int src, int dest, int nb) {
        return String.format("MOVE %d %d %d", src, dest, nb);
    }
}

class Factory {
  final int id;
  int owner;
  int stock, prod;
  int virtualStock;
  boolean increaseQueried;
  final Map<Factory, Integer> neighbors;

  public Factory(int id) {
    this.id = id;
    this.neighbors = new HashMap<>();
  }

  public void update(int avg) {
    if (avg * (1 - Player.IGNORE_TSD) > this.virtualStock) {
      Player.queries.add(new Query(this, this.virtualStock - avg));
    }
    else if (this.virtualStock > avg) {
      Player.queries.add(new Query(this, avg - this.virtualStock));
    }

    if (avg > Player.INCREASE_TSD && this.prod < 3) {
      Player.queries.add(new IncreaseQuery(this));
      this.increaseQueried = true;
    }
  }

  @Override
  public boolean equals(Object o) {
    if (o instanceof Factory)
      return this.id == ((Factory) o).id;
    return false;
  }

  @Override
  public int hashCode() {
    return this.id;
  }
}

class Action {
  Factory src, dest;
  int toSend;

  public Action(Factory src, Factory dest, int toSend) {
    this.src = src;
    this.dest = dest;
    this.toSend = toSend;
  }
}

class Query {
  Factory factory;
  int nb;

  public Query(Factory factory, int nb) {
    this.factory = factory;
    this.nb = nb;
  }
}

class IncreaseQuery extends Query {
  public IncreaseQuery(Factory factory) {
    super(factory, -10);
  }
}
