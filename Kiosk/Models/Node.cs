using System;

namespace Kiosk.Models
{
    public class Node : IComparable
    {
        public int ID { get; set; }
        public string Text { get; set; }

        public int CompareTo(object obj)
        {
            if (obj == null)
                return 1;
            var compareNode = obj as Node;
            return ID.CompareTo(compareNode.ID);
        }

        public override bool Equals(object other)
        {
            var otherNode = other as Node;
            if (otherNode == null)
                return false;
            return ID == otherNode.ID;
        }

        public override int GetHashCode()
        {
            return this.GetType().ToString().GetHashCode() + (int)this.ID;
        }
    }

    public class NodeRelation {
        public Node child { get; set; }
        public Node parent { get; set; }
    }

    
}
