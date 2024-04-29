using Kiosk.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace Kiosk.Controllers
{
    public class HomeController : Controller
    {
        private DataRepository repo = new DataRepository();
        public ActionResult Index()
        {  
            var retval = repo.getLanguages();
            return View(retval);
        }

        public ActionResult GetMenuItems(int Language_CD)
        {
            var availableNodes = repo.getMenuItems(Language_CD);
            Dictionary<Node, List<Node>> dict = new Dictionary<Node, List<Node>>();
            foreach (var i in availableNodes)
            {
                if (!dict.ContainsKey(i.parent))
                {
                    dict.Add(i.parent, new List<Node>());
                }
                dict[i.parent].Add(i.child);

            }
            return Json(dict.ToList(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult About()
        {
           
            ViewBag.Message = "Your application description page.";
            
            return View();
        }

        public ActionResult Admin()
        {
            var retval = repo.getLanguages();
            return View(retval);
        }

        public ActionResult SaveNode(Node SavedNode, int Language_CD, Node ParentNode)
        {
            if (SavedNode.ID == 0)
            {
                repo.insertNode(SavedNode, Language_CD, ParentNode);
            }
            else
            {
                repo.saveNodeTranslation(SavedNode, Language_CD);
            }

            return RedirectToAction("GetMenuItems", new { Language_CD = Language_CD });
        }
        public ActionResult DeleteNode(Node node, int language)
        {
            repo.deleteNode(node);
            return RedirectToAction("GetMenuItems", new { Language_CD = language });
        }
    }
}