package semantic;

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

public class Main {
	public static void main(String[] args) {
		String inputFileName = "animes.ttl";
		
		// create an empty model
		Model model = ModelFactory.createDefaultModel();

		// use the FileManager to find the input file
		InputStream in = FileManager.get().open( inputFileName );
		if (in == null)
		    throw new IllegalArgumentException("File: " + inputFileName + " not found");

		// read the RDF/TTL file
		model.read(in, null, "Turtle");

		// write it to standard out
		//model.write(System.out);
		
		String queryString =
			"PREFIX schema: <http://schema.org/>" +
			"PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>" +
			"SELECT ?titre " +
		    "WHERE {" +
				"?anime schema:genre ?genre." +
				"?anime schema:name ?titre." +
				"FILTER (?genre = \"Vampire\")." +
				"FILTER (lang(?titre) = 'jp')" +
			"}" +
		    "LIMIT 100";

		Query query = QueryFactory.create(queryString) ;
		try (QueryExecution qexec = QueryExecutionFactory.create(query, model)) {
			ResultSet results = qexec.execSelect() ;
			ResultSetFormatter.out(System.out, results, query);
		}
	}
}
