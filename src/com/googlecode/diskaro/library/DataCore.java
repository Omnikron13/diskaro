/**
 * 
 */
package com.googlecode.diskaro.library;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * @author S4T4N
 * Core logic & structure shared by all objects that represent database entries
 * that have an id & name.
 */
public abstract class DataCore {
	//Internal database uid
	protected int id;
	//Human readable name
	protected String name;
	
	/**
	 * Return the UID used by the library database.
	 * @return the UID
	 */
	public int getID() {
		return this.id;
	}
	
	/**
	 * Return the human-readable name.
	 * @return the name
	 */
	public String getName() {
		return this.name;
	}
	
	//SQL Statement needed by setName()
	protected PreparedStatement setNameStatement = null;
	protected PreparedStatement setNameStatement() throws SQLException {
		if(setNameStatement == null) {
			setNameStatement = Library.getDB().prepareStatement("UPDATE "+getTable()+" SET name = ? WHERE id = ?;");
			setNameStatement.setInt(2, id);
		}
		return setNameStatement;
	}
	/**
	 * Sets the name of the tag/genre/track/etc. in the database.
	 * @param name new name of the tag/genre/track/etc.
	 * @throws SQLException
	 */
	public void setName(String name) throws SQLException {
		PreparedStatement ps = setNameStatement();
		ps.setString(1, name);
		ps.executeUpdate();
		this.name = name;
	}
	
	/**
	 * @see getName()
	 */
	public String toString() {
		return getName();
	}
	
	/**
	 * DataCore objects are compared by both their specific subclass and their uid
	 */
	public boolean equals(Object obj) {
		if(this.getClass() != obj.getClass()) {
			return false;
		}
		DataCore dc = (DataCore) obj;
		if(id == dc.getID()) {
			return true;
		}
		return false;
	}
	
	/**
	 * DataCore hash codes are merely their uid
	 */
	public int hashCode() {
		return id;
	}
	
	//Allows sub-classes to identify their main db table
	protected abstract String getTable();
	
	//Empty constructor for subclasses which wish to handle their entire construction
	protected DataCore() {
		
	}
	
	//Basic constructors for subclasses which only need to setup id & name
	protected DataCore(int id) throws SQLException {
		getByID(id);
	}
	
	protected DataCore(String name) throws SQLException {
		getByName(name);
	}
	
	//Pulls a single row from the relevant table by its id and returns the ResultSet, for constructors etc.
	protected ResultSet getByID(int id) throws SQLException {
		getByIDStatements.fetch(getTable()).setInt(1, id);
		ResultSet rs = getByIDStatements.fetch(getTable()).executeQuery();
		this.id = id;
		this.name = rs.getString("name");
		return rs;
	}
		
	//As above, but by name - only useful in constructors when that is unique!
	protected ResultSet getByName(String name) throws SQLException {
		getByNameStatements.fetch(getTable()).setString(1, name);
		ResultSet rs = getByNameStatements.fetch(getTable()).executeQuery();
		this.id = rs.getInt("id");
		this.name = name;
		return rs;
	}
	
	//Method that allows subclasses to easily implement a static get() method for
	//pulling all rows from their associated database table and returning an ArrayList
	//holding instances of their particular subclass
	protected static ArrayList<?> get(Class<?> cl) throws Exception {
		Constructor<?> con = cl.getConstructor(int.class);
		ResultSet rs = getStatements.fetch((String)cl.getMethod("table").invoke(null)).executeQuery();
		ArrayList<Object> objs = new ArrayList<Object>(20);
		while(rs.next()) {
			objs.add(con.newInstance(rs.getInt(1)));
		}
		return objs;
	}
	
	/**
	 * Removes the tag/genre/track/etc. from the database.
	 * @throws SQLException
	 */
	public void remove() throws SQLException {
		PreparedStatement ps = removeByIDStatements.fetch(getTable());
		ps.setInt(1, getID());
		ps.executeUpdate();
	}
	
	//Class for creating and holding PreparedStatements generated from templates
	//to allow sub-classes to at more elegantly
	protected static class Statements extends HashMap<String, PreparedStatement> { //No serialVersionUID, but probably doesn't need to be serialised
		protected String template;
		protected int returnKeys;
		public Statements(String template) {
			this(template, Statement.NO_GENERATED_KEYS);
		}
		public Statements(String template, int returnKeys) {
			super();
			this.template = template;
			this.returnKeys = returnKeys;
		}
		public PreparedStatement fetch(String... tables) throws SQLException {
			if(!containsKey(tables[0])) {
				String sql = template;
				for(int x=0; x < tables.length; x++) {
					sql = sql.replaceAll("<t"+x+">", tables[x]);
				}
				put(tables[0], Library.getDB().prepareStatement(sql, returnKeys));
			}
			return get(tables[0]);
		}
	}
	
	protected static Statements getByIDStatements = new Statements("SELECT * FROM <t0> WHERE id = ?;");
	protected static Statements getByNameStatements = new Statements("SELECT * FROM <t0> WHERE name = ?;");
	protected static Statements getStatements = new Statements("SELECT id from <t0> ORDER BY name;");
	protected static Statements removeByIDStatements = new Statements("DELETE FROM <t0> WHERE id = ?;");
}
