package websemantique;

import java.io.InputStream;

import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFormatter;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.util.FileManager;

public class Etape2 {
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
		String inputFileName = "animelist.ttl";
		
		// create an empty model
		Model model = ModelFactory.createDefaultModel();

		// use the FileManager to find the input file
		InputStream in = FileManager.get().open( inputFileName );
		if (in == null) {
		    throw new IllegalArgumentException(
		                                 "File: " + inputFileName + " not found");
		}

		// read the RDF/XML file
		model.read(in, null, "Turtle");

		// write it to standard out
		//model.write(System.out);
		
		String queryString =
				"SELECT ?titre " +
		    	"WHERE { ?anime <http://dbpedia.org/ontology#numberOfEpisodes> ?nbEpisodes. ?anime <http://schema.org/name> ?titre}" +
		    	"LIMIT 100";

		    	Query query = QueryFactory.create(queryString) ;
		    	try (QueryExecution qexec = QueryExecutionFactory.create(query, model)) {
		    		ResultSet results = qexec.execSelect() ;
		    		ResultSetFormatter.out(System.out, results, query);
		}
	}
}
